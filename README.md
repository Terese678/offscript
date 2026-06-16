# Offscript 🎬

> Your story. Your device. No cloud needed.

Offscript is an offline AI assistant built for filmmakers who work in locations with no internet. Write scenes, dialogue, shot lists, and character profiles — all generated locally on your device using QVAC SDK.

No external APIs fully local via QVAC runtime

## The Story

Kofi is a young filmmaker on location in rural Ghana. Golden hour is dying. His internet died 3 hours ago. His scene isn't working.

He opens his laptop. Offscript loads. He smiles. 

## Features

- ✅ Scene writing
- ✅ Dialogue generation
- ✅ Shot lists
- ✅ Character profiles
- ✅ Runs 100% offline on your device
- 🔨 Script library (coming soon)
- 🔨 Voice input (coming soon)
- 🔨 Continuity checker (coming soon)

## Built With

- [QVAC SDK](https://qvac.tether.io) — on-device AI inference
- React + Vite — frontend
- Node.js + Express — backend
- Bare runtime — AI worker

## Setup

```bash
# Install dependencies
npm install
cd client && npm install

# Start the AI engine
bare bare-server.js

# Start the backend
npm start

# Start the frontend
cd client && npm run dev
```

## Hackathon

Built for the QVAC Unleash Edge AI Hackathon 2026.
Follow the build: [@ter_chimbiv](https://x.com/ter_chimbiv) #teamOffscript

## License

MIT