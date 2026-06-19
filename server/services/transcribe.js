// transcribe.js — The transcription service
// Calls QVAC SDK directly from Node.js — no file bridge needed

import { loadModel, transcribe } from "@qvac/sdk"

const WHISPER_URL = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin"

// Load the Whisper model once and reuse it for all transcriptions
// This avoids reloading the model on every request
let whisperModelId = null

async function getWhisperModel() {
  if (!whisperModelId) {
    console.log("Loading Whisper model in Express...")
    whisperModelId = await loadModel({
      modelSrc: WHISPER_URL,
      modelType: "whispercpp-transcription",
    })
    console.log("Whisper model ready.")
  }
  return whisperModelId
}

export async function transcribeAudio(audioPath) {
  // Get the model — loads once, reuses after that
  const modelId = await getWhisperModel()

  console.log("Transcribing:", audioPath)

  // Call transcribe directly — returns a plain string
  const transcript = await transcribe({
    modelId,
    audioChunk: audioPath,
  })

  console.log("Transcript:", transcript)
  return transcript
}