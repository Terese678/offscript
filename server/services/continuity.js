// continuity.js: The continuity checking service
// All QVAC/RAG work happens inside bare-server.js — this file only
// writes a request file and polls for the response, same as qvac.js

import { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs"
import path from "path"

const CONTINUITY_REQUEST_FILE = path.join(process.cwd(), "..", "continuity-request.txt")
const CONTINUITY_RESPONSE_FILE = path.join(process.cwd(), "..", "continuity-response.txt")

export async function checkContinuity(scenes) {
  if (existsSync(CONTINUITY_RESPONSE_FILE)) unlinkSync(CONTINUITY_RESPONSE_FILE)

  writeFileSync(CONTINUITY_REQUEST_FILE, JSON.stringify(scenes))

  return new Promise((resolve, reject) => {
    const start = Date.now()

    const check = setInterval(() => {
      if (existsSync(CONTINUITY_RESPONSE_FILE)) {
        const response = readFileSync(CONTINUITY_RESPONSE_FILE, "utf8")
        clearInterval(check)

        try {
          const parsed = JSON.parse(response)
          if (parsed && parsed.error) {
            reject(new Error(parsed.error))
            return
          }
        } catch {
          // not JSON, that's a normal text response — fine
        }

        resolve(response)
        return
      }
      if (Date.now() - start > 600000) {
        clearInterval(check)
        reject(new Error("Timeout waiting for continuity check"))
      }
    }, 1000)
  })
}