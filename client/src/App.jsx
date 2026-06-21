// Offscript: Offline AI assistant for filmmakers
// Built with React + Framer Motion + QVAC SDK
// Every line commented so any filmmaker-developer can understand it

import ScriptLibrary, { saveToLibrary } from "./ScriptLibrary"

import ContinuityChecker from "./ContinuityChecker"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// --- PARTICLE ---
// A single floating light particle in the sky background
// Each one moves slowly upward and fades out like embers from a fire
function Particle({ x, delay, size }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${x}%`,
        bottom: "0%",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(232, 160, 32, 0.6)",
        filter: "blur(1px)",
      }}
      animate={{
        y: [0, -600],
        opacity: [0, 0.8, 0],
        x: [0, Math.random() * 60 - 30],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  )
}

// --- SUN RAYS ---
// Animated light rays that spread from the horizon
// Like the last rays of sun before it disappears
function SunRays() {
  const rays = Array.from({ length: 8 })
  return (
    <div style={{ position: "absolute", bottom: "20%", left: "50%", transform: "translateX(-50%)" }}>
      {rays.map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "2px",
            height: "300px",
            background: "linear-gradient(to top, rgba(232,160,32,0.4), transparent)",
            transformOrigin: "bottom center",
            rotate: `${(i - 4) * 18}deg`,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3], scaleY: [0.8, 1.1, 0.8] }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

// --- CINEMATIC LANDING ---
// The first screen the filmmaker sees when they open Offscript
// Full screen, emotional, alive with motion
function CinematicLanding({ onEnter }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 4,
    size: `${2 + Math.random() * 4}px`,
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(to bottom, #050810 0%, #0f0a02 50%, #3a1800 80%, #e85000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Floating ember particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Sun rays from the horizon */}
      <SunRays />

      {/* The glowing sun circle at the horizon */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff5e0 0%, #e85000 50%, transparent 100%)",
          filter: "blur(2px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main title and tagline */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
        style={{ textAlign: "center", zIndex: 2, padding: "0 20px" }}
      >
        {/* Watery glassy title: light refracting through the letters */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(36px, 6vw, 72px)",
          margin: 0,
          letterSpacing: "-1px",
          lineHeight: 1.1,
          background: "linear-gradient(135deg, #fff8f0 0%, #e8c88a 30%, #ffffff 50%, #d4a040 70%, #fff0d8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 20px rgba(232,160,32,0.5))",
        }}>
          Offscript
        </h1>

        {/* Tagline: glassy water shimmer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            letterSpacing: "5px",
            background: "linear-gradient(90deg, transparent, rgba(242,232,213,0.7), transparent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textTransform: "uppercase",
            margin: "16px 0 44px",
          }}
        >
          Your story. Your device. No cloud needed.
        </motion.p>

        {/* Frosted glass button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnter}
          style={{
            background: "transparent",
            border: "1px solid rgba(232,160,32,0.5)",
            backdropFilter: "blur(4px)",
            color: "#e8d0a0",
            padding: "14px 44px",
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: "2px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Begin writing
        </motion.button>
      </motion.div>

      {/* Bottom credit: visible this time */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: "absolute",
          bottom: "32px",
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          color: "rgba(242,232,213,0.5)",
          letterSpacing: "2px",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Powered by QVAC · Runs entirely on your device
      </motion.p>
    </motion.div>
  )
}

// --- QUICK PROMPT TEMPLATES ---
// Pre-written prompts the filmmaker can click
// So they never start from a blank page
const TEMPLATES = [
  { icon: "🎭", name: "Write a scene", prompt: "Write an opening scene set in a busy African market. Include sights, sounds, smells, and one character who stands out from the crowd." },
  { icon: "🎙️", name: "Write dialogue", prompt: "Write a tense dialogue between a father and his son about leaving their village for the city. Keep it real, no melodrama." },
  { icon: "📋", name: "Shot list", prompt: "Create a shot list for a scene where a woman walks through a crowded market and realizes she is being followed." },
  { icon: "🧑", name: "Character profile", prompt: "Create a detailed character profile for a 45-year-old female market trader in Lagos who secretly writes poetry at night." },
  { icon: "🪢", name: "Fix continuity", prompt: "Review this scene for continuity errors and suggest fixes:" },
  { icon: "🎬", name: "Story outline", prompt: "Write a 5-act story outline for a short film about a young musician who discovers their grandfather was a famous griot." },
]

// --- MAIN WORKING TOOL ---
// Clean focused writing space after the cinematic landing
function WorkingTool() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [showContinuity, setShowContinuity] = useState(false) // our continuity state

  // When filmmaker clicks a template, fill the text area with it
  function selectTemplate(template) {
    setActiveTemplate(template.name)
    setPrompt(template.prompt)
  }

  // Send the prompt to our Node.js backend which talks to QVAC
  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setResponse("")
    try {
      const res = await fetch("http://localhost:3001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setResponse(data.result)
      saveToLibrary(prompt, data.result, activeTemplate || "Script")
    } catch (err) {
      setResponse("Could not connect to local AI. Make sure the Offscript server is running on port 3001.")
    }
    setLoading(false)
  }

  // Start recording from the microphone
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000
      } 
    })
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
    const chunks = []

    recorder.ondataavailable = (e) => chunks.push(e.data)

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" })
      const formData = new FormData()
      formData.append("audio", blob, "audio.wav")

      try {
        const res = await fetch("http://localhost:3001/transcribe", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.transcript) setPrompt(data.transcript)
      } catch (err) {
        console.error("Transcription failed:", err)
      }
    }

    recorder.start()
    setMediaRecorder(recorder)
    setRecording(true)
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(t => t.stop())
    }
    setRecording(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #060810 0%, #0c0a08 70%, #1a0c00 100%)",
        color: "#f2e8d5",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div style={{
        padding: "16px 28px",
        borderBottom: "1px solid #1e1a14",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "24px",
            background: "linear-gradient(135deg, #fff8f0 0%, #e8c88a 40%, #ffffff 60%, #d4a040 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0,
          }}>
            Offscript
          </h1>
          <span style={{ fontSize: "11px", color: "#3a3020", letterSpacing: "2px", textTransform: "uppercase" }}>
            Filmmaker's AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Offline status indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#0c1a0c", border: "1px solid #1a3020",
            borderRadius: "20px", padding: "6px 14px",
          }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4a9060" }}
            />
            <span style={{ fontSize: "11px", color: "#4a9060" }}>AI running offline</span>
          </div>

          {/* Library button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLibrary(true)}
            style={{
              background: "transparent",
              border: "1px solid #1e1a14",
              color: "#c8b898",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "1px",
            }}
          >
            📚 Library
          </motion.button>

          {/* Continuity button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowContinuity(true)}
            style={{
              background: "transparent",
              border: "1px solid #1e1a14",
              color: "#c8b898",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "1px",
            }}
          >
            🔍 Continuity
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        flex: 1,
      }}>

        {/* Left sidebar, templates */}
        <div style={{
          padding: "20px 16px",
          borderRight: "1px solid #1e1a14",
        }}>
          <p style={{
            fontSize: "10px", letterSpacing: "2px",
            textTransform: "uppercase", color: "#3a3020", marginBottom: "12px", marginTop: 0,
          }}>
            Quick prompts
          </p>

          {TEMPLATES.map((t) => (
            <motion.div
              key={t.name}
              whileHover={{ x: 4 }}
              onClick={() => selectTemplate(t)}
              style={{
                padding: "10px 12px",
                marginBottom: "6px",
                borderRadius: "8px",
                cursor: "pointer",
                background: activeTemplate === t.name ? "#1a1200" : "transparent",
                border: `1px solid ${activeTemplate === t.name ? "#e8a020" : "#1e1a14"}`,
              }}
            >
              <div style={{ fontSize: "14px", marginBottom: "3px" }}>{t.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#c8b898" }}>{t.name}</div>
            </motion.div>
          ))}
        </div>

        {/* Right writing area */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#3a3020", margin: 0 }}>
                Your prompt
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={recording ? stopRecording : startRecording}
                style={{
                  background: recording ? "#3a0000" : "transparent",
                  border: `1px solid ${recording ? "#e82020" : "#1e1a14"}`,
                  color: recording ? "#e82020" : "#c8b898",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  letterSpacing: "1px",
                }}
              >
                {recording ? "⏹ Stop recording" : "🎙️ Speak prompt"}
              </motion.button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you need — a scene, dialogue, shot list, character..."
              rows={6}
              style={{
                width: "100%",
                background: "#0e0c08",
                border: "1px solid #1e1a14",
                borderRadius: "8px",
                padding: "14px 16px",
                color: "#f2e8d5",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: "1.7",
                outline: "none",
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={loading}
            style={{
              background: loading ? "#5a4010" : "#e8a020",
              color: loading ? "#a08030" : "#0c0800",
              border: "none",
              borderRadius: "8px",
              padding: "13px 28px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              alignSelf: "flex-start",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            {loading ? "Generating locally..." : "Generate offline ›"}
          </motion.button>

          {/* AI response, slides in when ready */}
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  background: "#0e0c08",
                  border: "1px solid #2a2010",
                  borderLeft: "3px solid #e8a020",
                  borderRadius: "8px",
                  padding: "20px 24px",
                }}
              >
                <p style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#e8a020", marginBottom: "12px", marginTop: 0 }}>
                  Offscript says
                </p>
                <p style={{ fontSize: "14px", lineHeight: "1.9", color: "#c8b898", margin: 0, whiteSpace: "pre-wrap" }}>
                  {response}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showLibrary && (
          <ScriptLibrary
            onClose={() => setShowLibrary(false)}
            onLoad={(p, r) => { setPrompt(p); setResponse(r); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContinuity && (
          <ContinuityChecker
            onClose={() => setShowContinuity(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #1e1a14",
        padding: "10px 28px",
        display: "flex",
        gap: "24px",
      }}>
        {["🖥️ Runs on your device", "📵 No internet needed", "🔒 Your scripts stay private"].map((item) => (
          <span key={item} style={{ fontSize: "11px", color: "#3a3020" }}>{item}</span>
        ))}
      </div>
    </motion.div>
  )
}

// --- ROOT APP ---
// Controls which screen shows
export default function App() {
  const [showLanding, setShowLanding] = useState(true)

  return (
    <div>
      <AnimatePresence>
        {showLanding && (
          <CinematicLanding onEnter={() => setShowLanding(false)} />
        )}
      </AnimatePresence>
      {!showLanding && <WorkingTool />}
    </div>
  )
}