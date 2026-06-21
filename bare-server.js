// bare-server.js: The QVAC AI runtime
// Runs in the Bare runtime (not Node.js) this is where all AI inference happens
// Watches for prompts written by the Express server, processes them, and writes results back

import { loadModel, completion, plugins, ragIngest, ragSearch } from "@qvac/sdk"
import { llmPlugin } from "@qvac/sdk/llamacpp-completion/plugin"
import { embeddingsPlugin } from "@qvac/sdk/llamacpp-embedding/plugin"
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "bare-fs"
import { dirname, join } from "bare-path"
import { z } from "zod"

// Register both plugins: LLM for generation, embeddings for the continuity checker's RAG search
plugins([llmPlugin, embeddingsPlugin])

// Get the absolute path of this file's directory
// bare-path is used instead of Node's path because this runs in the Bare runtime
const __dirname = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))

// Remote model URLs — downloaded once and cached locally by the QVAC SDK
const MODEL_URL = "https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_0.gguf"
const EMBEDDING_MODEL_URL = "https://huggingface.co/CompendiumLabs/bge-base-en-v1.5-gguf/resolve/main/bge-base-en-v1.5-f32.gguf"

// File bridge paths: Express server and bare-server communicate through these files
const PROMPT_FILE = join(__dirname, "prompt.txt")
const RESPONSE_FILE = join(__dirname, "response.txt")
const STATUS_FILE = join(__dirname, "status.txt")

// New file bridge pair for the continuity checker, same pattern, separate files
const CONTINUITY_REQUEST_FILE = join(__dirname, "continuity-request.txt")
const CONTINUITY_RESPONSE_FILE = join(__dirname, "continuity-response.txt")

console.log("Files will be written to:", __dirname)
console.log("Loading LLM model...")

const modelId = await loadModel({
  modelSrc: MODEL_URL,
  modelType: "llamacpp-completion",
  modelConfig: { ctx_size: 4096, gpu_layers: 0, device: "cpu" },
})

console.log("LLM model ready.")

// Embedding model is lazy-loaded on first continuity check, not at startup,
// so a normal generate-only session never pays that extra load time
let embeddingModelId = null

async function getEmbeddingModel() {
  if (!embeddingModelId) {
    console.log("Loading embedding model for continuity checker...")
    embeddingModelId = await loadModel({
      modelSrc: EMBEDDING_MODEL_URL,
      modelType: "embeddings",
      modelConfig: { device: "cpu" },
    })
    console.log("Embedding model ready.")
  }
  return embeddingModelId
}

console.log("Watching for prompts...")
writeFileSync(STATUS_FILE, "ready")
let llmBusy = false

// --- LLM WATCHER --- 
let lastPrompt = ""

async function llmWatcher() {
  while (true) {
    await new Promise(r => setTimeout(r, 1000))

    if (!existsSync(PROMPT_FILE)) continue

    const prompt = readFileSync(PROMPT_FILE, "utf8").trim()

    if (!prompt || prompt === lastPrompt) continue

    lastPrompt = prompt
    writeFileSync(STATUS_FILE, "generating")

    const history = [
      { role: "system", content: "You are Offscript, an AI assistant for filmmakers. When given a prompt, write a complete, detailed response immediately. Never ask follow up questions. Never ask what to add. Just write the full scene, dialogue, shot list or character profile requested." },
      { role: "user", content: prompt }
    ]

    llmBusy = true
    let result = ""
    const response = completion({ modelId, history, stream: true })
    for await (const token of response.tokenStream) {
      result += token
    }
    llmBusy = false
    const cleaned = result.replace(/<think>[\s\S]*?<\/think>/g, "").trim()

    writeFileSync(RESPONSE_FILE, cleaned)
    writeFileSync(STATUS_FILE, "ready")
    console.log("Response written.")
  }
}

// --- CONTINUITY WATCHER --- 
let lastContinuityRequest = ""

async function continuityWatcher() {
  while (true) {
    await new Promise(r => setTimeout(r, 1000))

    if (!existsSync(CONTINUITY_REQUEST_FILE)) continue

    console.log("Continuity request detected, processing...")
    const raw = readFileSync(CONTINUITY_REQUEST_FILE, "utf8").trim()
    unlinkSync(CONTINUITY_REQUEST_FILE)

    if (!raw) continue

    writeFileSync(STATUS_FILE, "checking-continuity")

    try {
      const scenes = JSON.parse(raw)
      const embedModelId = await getEmbeddingModel()
      const workspace = `continuity-${Date.now()}`

      console.log(`Ingesting ${scenes.length} scenes into RAG workspace: ${workspace}`)

      await ragIngest({
        modelId: embedModelId,
        workspace,
        documents: scenes,
        chunk: true,
      })

      const continuityQueries = [
        "character names and their descriptions",
        "locations and where scenes take place",
        "time of day morning afternoon evening night",
        "props and objects characters are holding or using",
        "character relationships and how they refer to each other",
        "clothing and physical appearance of characters",
      ]

      console.log("Cross-referencing scenes for continuity conflicts...")

      const conflictChunks = []

      for (const query of continuityQueries) {
        const results = await ragSearch({
          modelId: embedModelId,
          workspace,
          query,
          topK: 3,
        })

        if (results && results.length > 0) {
          conflictChunks.push({
            dimension: query,
            results: results.map(r => r.text || r.content || r),
          })
        }
      }
      console.log("Running script doctor analysis...")

      while (llmBusy) {
        await new Promise(r => setTimeout(r, 500))
      }

      const history = [
        { role: "user", content: `Extract these exact facts from the two scenes below. Respond with ONLY these 8 lines, nothing else, no explanation, no extra text.

NAME1: <name of the character performing the action in scene 1 — NOT names only mentioned in dialogue>
NAME2: <name of the character performing the action in scene 2 — NOT names only mentioned in dialogue>
WEAPON1: <weapon or prop the character is holding or using in scene 1, or none>
WEAPON2: <weapon or prop the character is holding or using in scene 2, or none>
CLOTHING1: <clothing the character is wearing in scene 1, or none>
CLOTHING2: <clothing the character is wearing in scene 2, or none>
LOCATION1: <location of scene 1>
LOCATION2: <location of scene 2>

Scene 1: ${scenes[0]}

Scene 2: ${scenes[1]}` }
      ]

      llmBusy = true
      let result = ""
      const response = completion({ modelId, history, stream: true })
      for await (const token of response.tokenStream) {
        result += token
      }
      llmBusy = false

      const cleaned = result.replace(/<\|.*?\|>/g, "").replace(/\r/g, "").trim()
      console.log("RAW MODEL OUTPUT:\n" + cleaned)

      // Pull a labeled value out of the model's raw text response.
      // Returns "" if that line wasn't found.
      function extractField(text, key) {
        const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))
        return match ? match[1].trim() : ""
      }

      const name1 = extractField(cleaned, "NAME1")
      const name2 = extractField(cleaned, "NAME2") || name1
      const weapon1 = extractField(cleaned, "WEAPON1")
      const weapon2 = extractField(cleaned, "WEAPON2")
      const clothing1 = extractField(cleaned, "CLOTHING1")
      const clothing2 = extractField(cleaned, "CLOTHING2")
      const location1 = extractField(cleaned, "LOCATION1")
      const location2 = extractField(cleaned, "LOCATION2")

      // Deterministic JS comparison — not the model's judgment.
      function compareField(label, a, b) {
        const aLower = a.toLowerCase().trim()
        const bLower = b.toLowerCase().trim()
        const isNone = (v) => v === "none" || v === "" || v.includes("not mention") || v.includes("not specified") || v.includes("not stated") || v.includes("n/a")

        if (isNone(aLower) || isNone(bLower)) {
          return `${label}: "${a}" / "${b}" — NOT ENOUGH INFO (one or both scenes don't mention this clearly)`
        }

        const match = aLower === bLower
        return `${label}: "${a}" / "${b}" — ${match ? "MATCH" : "MISMATCH"}`
      }

      const trimmed = name1
        ? [
            compareField("Name", name1, name2),
            compareField("Weapon", weapon1, weapon2),
            compareField("Clothing", clothing1, clothing2),
            `Location: Scene 1 — "${location1}", Scene 2 — "${location2}" (location changes between scenes are expected, not a continuity error)`,
          ].join("\n")
        : `Could not parse model response:\n${cleaned}`

      writeFileSync(CONTINUITY_RESPONSE_FILE, trimmed)
      console.log("Continuity response written.")

    } catch (error) {
      console.error("Continuity check error:", error.message)
      writeFileSync(CONTINUITY_RESPONSE_FILE, JSON.stringify({ error: error.message }))
    }

    writeFileSync(STATUS_FILE, "ready")
  }
}

llmWatcher()
continuityWatcher()