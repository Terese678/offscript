import { loadModel, completion, plugins } from "@qvac/sdk"
import { llmPlugin } from "@qvac/sdk/llamacpp-completion/plugin"
import { readFileSync, writeFileSync, existsSync } from "bare-fs"

plugins([llmPlugin])

const MODEL_URL = "https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_0.gguf"
const PROMPT_FILE = "./prompt.txt"
const RESPONSE_FILE = "./response.txt"
const STATUS_FILE = "./status.txt"

console.log("Loading model...")

const modelId = await loadModel({
  modelSrc: MODEL_URL,
  modelType: "llamacpp-completion",
})

console.log("Model ready. Watching for prompts...")
writeFileSync(STATUS_FILE, "ready")

// Poll every second for a new prompt file
let lastPrompt = ""

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

  let result = ""
  const response = completion({ modelId, history, stream: true })
  for await (const token of response.tokenStream) {
    result += token
  }

  const cleaned = result.replace(/<think>[\s\S]*?<\/think>/g, "").trim()
  writeFileSync(RESPONSE_FILE, cleaned)
  writeFileSync(STATUS_FILE, "ready")
  console.log("Response written.")
}