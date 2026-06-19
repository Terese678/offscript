// bare-server.js — The QVAC AI runtime
// Runs in the Bare runtime (not Node.js) — this is where all AI inference happens
// Watches for prompts written by the Express server, processes them, and writes results back

import { loadModel, completion, plugins } from "@qvac/sdk"
import { llmPlugin } from "@qvac/sdk/llamacpp-completion/plugin"
import { readFileSync, writeFileSync, existsSync } from "bare-fs"
import { dirname, join } from "bare-path"

// Register LLM plugin only — Whisper is now handled directly by Express
plugins([llmPlugin])

// Get the absolute path of this file's directory
// bare-path is used instead of Node's path because this runs in the Bare runtime
const __dirname = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))

// Remote model URL — downloaded once and cached locally by the QVAC SDK
const MODEL_URL = "https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_0.gguf"

// File bridge paths — Express server and bare-server communicate through these files
// All paths are absolute so both servers always read and write to the same locations
const PROMPT_FILE = join(__dirname, "prompt.txt")     // Express writes prompt here
const RESPONSE_FILE = join(__dirname, "response.txt") // bare-server writes LLM response here
const STATUS_FILE = join(__dirname, "status.txt")     // tracks current AI status

console.log("Files will be written to:", __dirname)
console.log("Loading LLM model...")

// Load the text generation model — cached after first download
const modelId = await loadModel({
  modelSrc: MODEL_URL,
  modelType: "llamacpp-completion",
})

console.log("LLM model ready. Watching for prompts...")

// Signal to Express that the AI is ready to receive requests
writeFileSync(STATUS_FILE, "ready")

// --- LLM WATCHER ---
// Polls every second for a new prompt written by Express
// When found, generates a response and writes it back to response.txt
let lastPrompt = ""

async function llmWatcher() {
  while (true) {
    await new Promise(r => setTimeout(r, 1000))

    // Skip if no prompt file exists yet
    if (!existsSync(PROMPT_FILE)) continue

    const prompt = readFileSync(PROMPT_FILE, "utf8").trim()

    // Skip if prompt is empty or same as last one (already processed)
    if (!prompt || prompt === lastPrompt) continue

    lastPrompt = prompt
    writeFileSync(STATUS_FILE, "generating")

    // System prompt tells the AI to behave like a filmmaker's assistant
    const history = [
      { role: "system", content: "You are Offscript, an AI assistant for filmmakers. When given a prompt, write a complete, detailed response immediately. Never ask follow up questions. Never ask what to add. Just write the full scene, dialogue, shot list or character profile requested." },
      { role: "user", content: prompt }
    ]

    // Stream the response token by token and collect into a string
    let result = ""
    const response = completion({ modelId, history, stream: true })
    for await (const token of response.tokenStream) {
      result += token
    }

    // Strip any internal <think> blocks the model may produce
    const cleaned = result.replace(/<think>[\s\S]*?<\/think>/g, "").trim()

    // Write the final response — Express is polling for this file
    writeFileSync(RESPONSE_FILE, cleaned)
    writeFileSync(STATUS_FILE, "ready")
    console.log("Response written.")
  }
}

// Start the LLM watcher
llmWatcher()