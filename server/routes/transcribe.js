// transcribe.js: The transcription route
// Receives audio from the UI, saves it to disk
// Passes the audio path to the transcription service which calls QVAC SDK directly in Node.js

import express from "express"
import multer from "multer"
import path from "path"
import { transcribeAudio } from "../services/transcribe.js"

const router = express.Router()

// Save uploaded audio to the root folder where QVAC SDK can access it
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "..")),
  filename: (req, file, cb) => cb(null, "audio.wav")
})
const upload = multer({ storage })

// POST /transcribe: the UI calls this when the filmmaker stops recording
router.post("/", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file received" })
  }

  const audioPath = path.join(process.cwd(), "..", "audio.wav")
  console.log(`Transcribing audio file: ${audioPath}`)

  try {
    const transcript = await transcribeAudio(audioPath)
    res.json({ transcript })
  } catch (error) {
    console.error("Transcription error:", error.message)
    res.status(500).json({ error: "Transcription failed. Check the terminal for details." })
  }
})

export default router