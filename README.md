# Offscript 🎬

> Your story. Your device. No cloud needed.

Offscript is an offline AI assistant built for filmmakers who work in locations with no internet. Write scenes, dialogue, shot lists, and character profiles, check continuity across scenes, and search your saved work all generated and processed **locally on your device** using the QVAC SDK. No external APIs, no cloud dependency, fully local via the QVAC runtime.

## The Story

Kofi is a young filmmaker on location in rural Ghana. Golden hour is dying. His internet died 3 hours ago. His scene isn't working.

He opens his laptop. Offscript loads. He smiles.

## Features

- ✅ **Scene, dialogue, shot list, and character profile generation** — via QVAC's `completion()` API, fully on-device
- ✅ **Continuity checker** — cross-references scenes using QVAC's RAG (`ragIngest`/`ragSearch`) to surface related details across scenes, then runs a local LLM pass to extract specific facts (character names, props/weapons, clothing, location) from each scene, and compares the extracted values in deterministic code rather than asking the model to judge "match or mismatch" itself
- ✅ **Voice input** — speech-to-text via QVAC's Whisper-based transcription (`transcribe()`)
- ✅ **Script library** — save, search, and reload past generations (stored locally on-device; search is a planned upgrade to semantic search via QVAC embeddings)
- ✅ Runs 100% offline once models are downloaded no internet required during use

## Built With

- [QVAC SDK](https://qvac.tether.io) (`@qvac/sdk`) on-device AI inference, RAG, and transcription. All AI inference in this project runs through QVAC.
- **Models used:**
  - `Llama-3.2-1B-Instruct-Q4_0` (GGUF) text generation and continuity-check extraction
  - `bge-base-en-v1.5` (GGUF) embeddings for RAG-based continuity cross-referencing
  - Whisper (`ggml-base.en.bin`) speech-to-text
- React + Vite — frontend
- Node.js + Express — backend bridge
- **Bare runtime** — hosts the QVAC AI worker (`bare-server.js`), separate from the Node/Express process

## Architecture

The app runs as three coordinated processes:

1. **Frontend** (`client/`, React + Vite) the UI
2. **Express server** (`server/`) receives requests from the frontend, writes them to disk, and relays responses back
3. **Bare AI runtime** (`bare-server.js`) loads and runs all QVAC models; communicates with Express via a simple file-bridge (request/response `.txt` files), since Bare and Node are separate JS runtimes

This file-bridge pattern was a deliberate choice: QVAC's Bare-based worker keeps model inference isolated from the Express process, so a slow or failed inference call can't block the HTTP server.

## Setup & Reproduction

**Requirements:** Node.js, npm, the [Bare runtime](https://bare.pears.com) installed globally.

```bash
# Install dependencies
npm install
cd client && npm install
cd ..
```

Open **three terminals**, all from the project root unless noted:

**Terminal 1: Frontend**
```bash
cd client
npm run dev
```

**Terminal 2: Express server**
```bash
npm start
```

**Terminal 3: Bare AI runtime**
```bash
bare bare-server.js
```

Wait for Terminal 3 to print `LLM model ready.` and `Watching for prompts...` (first run downloads ~1–2GB of models expect this to take a few minutes). Then open the URL printed by Terminal 1 in your browser.

## Hardware & Performance Notes

Developed and tested on:
- **CPU:** Intel Core i7-5600U @ 2.60GHz (dual-core, 5th-gen mobile)
- **RAM:** ~16GB
- **OS:** Windows 11 Pro

All inference runs on **CPU**, not GPU (see below for why) a deliberate choice that also means this runs on genuinely constrained, years-old consumer hardware, not a high-end workstation.

**A known, documented tradeoff:** during development, GPU (Vulkan) inference intermittently produced a `vk::Device::waitForFences: ErrorDeviceLost` crash on this hardware/driver combination after a model completion finished. Rather than ship something that could silently fail mid-demo, models are explicitly loaded with `device: "cpu"` in `modelConfig`. This trades inference speed (CPU completions can take 30–90+ seconds on this hardware) for reliability. On more capable or better-driver-supported hardware, removing `device: "cpu"` from the `modelConfig` in `bare-server.js` should re-enable GPU acceleration I leave it CPU-only here for reproducible, crash-free demoing on the hardware we tested on.

## Known Limitations

In the interest of transparency:

- The continuity checker uses a small (1B parameter), CPU-run model to extract facts from scene text before comparing them in code. On occasion, the model omits a field or phrases an answer inconsistently between runs. Rather than guess, the comparison logic is written to fail safely: if either side of a comparison is missing or ambiguous, the result is reported as **"NOT ENOUGH INFO"** instead of asserting a possibly-false match or mismatch. I chose honest uncertainty over confident inaccuracy.
- I evaluated QVAC's tool-calling support (`completion()` with a `tools` array) using the documented pattern and `QWEN3_1_7B_INST_Q4`. In my testing, the model reasoned about tool availability but did not invoke the tool call mechanism. We're noting this as an honest finding rather than claiming a capability we couldn't verify working.
- Script library search is currently substring-based; semantic search via QVAC embeddings (reusing the same embedding model already loaded for the continuity checker) is a natural next step.

## Hackathon

Built for the QVAC Unleash Edge AI Hackathon I (Tether), June 2026.
Follow the build: [@ter_chimbiv](https://x.com/ter_chimbiv)

## License

MIT