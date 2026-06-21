// qvac.js: The LLM generation service
// Writes the prompt to a file, bare-server.js picks it up, generates a response and writes it back
// Express polls for the response file and returns it to the frontend

import { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs"
import path from "path"

const PROMPT_FILE = path.join(process.cwd(), "..", "prompt.txt")
const RESPONSE_FILE = path.join(process.cwd(), "..", "response.txt")
const STATUS_FILE = path.join(process.cwd(), "..", "status.txt")

export async function generateText(prompt) {
  // Clear old response file if it exists
  if (existsSync(RESPONSE_FILE)) unlinkSync(RESPONSE_FILE)

  // Write the prompt — bare-server.js is watching and will pick this up
  writeFileSync(PROMPT_FILE, prompt)

  // Poll every second until bare-server.js writes the response
  return new Promise((resolve, reject) => {
    const start = Date.now()
    
    const check = setInterval(() => {
      // Check if response file exists
      if (existsSync(RESPONSE_FILE)) {
        const response = readFileSync(RESPONSE_FILE, "utf8")
        clearInterval(check)
        resolve(response)
        return
      }
      // Timeout after 3 minutes
      if (Date.now() - start > 600000) {
        clearInterval(check)
        reject(new Error("Timeout waiting for AI response"))
      }
    }, 1000)
  })
}