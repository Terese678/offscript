// generate.js — The generate route
// This file has ONE job: handle POST requests to /generate
// It receives the prompt from the UI, passes it to the QVAC service, returns the result

import express from "express"
import { generateText } from "../services/qvac.js"

// Create a router — this is Express's way of grouping related routes
const router = express.Router()

// POST /generate — the UI calls this when the filmmaker clicks "Generate offline"
router.post("/", async (req, res) => {
  const { prompt } = req.body

  // If no prompt was sent, return an error immediately
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "No prompt provided" })
  }

  console.log(`Generating response for prompt: "${prompt.slice(0, 60)}..."`)

  try {
    // Send the prompt to the QVAC service and wait for the result
    const result = await generateText(prompt)

    // Send the result back to the UI
    res.json({ result })

  } catch (error) {
    // If something goes wrong with the AI, tell the UI clearly
    console.error("Generation error:", error.message)
    res.status(500).json({ error: "AI generation failed. Check the terminal for details." })
  }
})

export default router