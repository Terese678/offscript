
import { loadModel, completion, unloadModel } from "@qvac/sdk"

const modelId = await loadModel({
  modelSrc: "https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_0.gguf",
  modelType: "llamacpp-completion",
})

const history = [
  { role: "system", content: "You are Offscript, an AI assistant for filmmakers. Help with screenwriting, scenes, dialogue, shot lists, and story development. Be practical and focused." },
  { role: "user", content: "Give me a scene of a man running in the streets of newyork" }
]

let result = ""
const response = completion({ modelId, history, stream: true })
for await (const token of response.tokenStream) {
  result += token
}

await unloadModel({ modelId })

// Print only the final result — the server reads this
const cleaned = result.replace(/<think>[\s\S]*?<\/think>/g, "").trim()
process.stdout.write(cleaned)
