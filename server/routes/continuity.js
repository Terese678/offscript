// continuity.js: The continuity checking route
import express from "express"
import { checkContinuity } from "../services/continuity.js"

const router = express.Router()

router.post("/", async (req, res) => {
  const { scenes } = req.body

  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
    return res.status(400).json({ error: "No scenes provided" })
  }

  console.log(`Checking continuity across ${scenes.length} scenes...`)

  try {
    const result = await checkContinuity(scenes)
    res.json({ result })
  } catch (error) {
    console.error("Continuity check error:", error.message)
    res.status(500).json({ error: "Continuity check failed. Check the terminal for details." })
  }
})

export default router