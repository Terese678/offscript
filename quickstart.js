// quickstart.js — The AI runner
// This file runs on Bare runtime which has no timeout issues
// The server calls this file with a prompt and reads the output
// Usage: bare quickstart.js "your prompt here"

// Import the QVAC SDK functions we need
import { loadModel, completion, unloadModel, plugins } from "@qvac/sdk"

// Import the llamacpp plugin using its named export — llmPlugin
import { llmPlugin } from "@qvac/sdk/llamacpp-completion/plugin"

// Register the plugin before making any SDK calls
// Without this, Bare doesn't know which AI engine to use
plugins([llmPlugin])

// Read the prompt from the command line argument
// Bare.argv[2] is the first argument after "bare quickstart.js"
const prompt = Bare.argv[2]

// If no prompt was passed, exit with an error
if (!prompt) {
  console.error("No prompt provided")
  Bare.exit(1)
}

try {
  // Step 1 — Load the model from local cache
  const modelId = await loadModel({
    modelSrc: "https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_0.gguf",
    modelType: "llamacpp-completion",
  })

  // Step 2 — Build the conversation
  const history = [
    {
      role: "system",
      content: "You are Offscript, an AI assistant for filmmakers. Help with screenwriting, scenes, dialogue, shot lists, and story development. Be practical and focused.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]

  // Step 3 — Run inference and collect streamed tokens
  let result = ""
  const response = completion({ modelId, history, stream: true })
  for await (const token of response.tokenStream) {
    result += token
  }

  // Step 4 — Clean up the model from memory
  await unloadModel({ modelId })

  // Step 5 — Remove <think>...</think> block and print the result
  const cleaned = result.replace(/<think>[\s\S]*?<\/think>/g, "").trim()
  console.log(cleaned)

} catch (error) {
  console.error("Error:", error.message)
  Bare.exit(1)
}