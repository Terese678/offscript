// index.js — The main server file
// This file has ONE job: start the Express server and connect all the pieces

import express from "express"
import cors from "cors"
import generateRoute from "./routes/generate.js"

const PORT = 3001

const app = express()

// Allow the React frontend to talk to this server
app.use(cors())

// Read JSON from incoming requests
app.use(express.json())

// Connect the generate route
app.use("/generate", generateRoute)

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Offscript server is running", offline: true })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Offscript server running at http://localhost:${PORT}`)
  console.log(`QVAC AI is ready. Waiting for prompts...`)
})