// ContinuityChecker.jsx: this is chapter 6 of Kofi's story
// let's say for instance scene 3 and Scene 12 don't match, what Offscript does is it catches it before the editor does.
// Kofi pastes his scenes, clicks check, and gets a script doctor analysis;mall offline!

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function ContinuityChecker({ onClose }) {
  const [scenes, setScenes] = useState(["", ""])
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Add a new empty scene input
  function addScene() {
    setScenes([...scenes, ""])
  }

  // Update a specific scene by index
  function updateScene(index, value) {
    const updated = [...scenes]
    updated[index] = value
    setScenes(updated)
  }

  // Remove a scene by index — minimum 2 scenes required
  function removeScene(index) {
    if (scenes.length <= 2) return
    setScenes(scenes.filter((_, i) => i !== index))
  }

  // Send scenes to the continuity checking endpoint
  async function handleCheck() {
    const filledScenes = scenes.filter(s => s.trim())
    if (filledScenes.length < 2) {
      setError("Please fill in at least 2 scenes to check.")
      return
    }

    setLoading(true)
    setResult("")
    setError("")

    try {
      const res = await fetch("http://localhost:3001/continuity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: filledScenes }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.result)
      }
    } catch (err) {
      setError("Could not connect to local AI. Make sure the Offscript server is running.")
    }

    setLoading(false)
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "480px",
        height: "100vh",
        background: "#08070a",
        borderLeft: "1px solid #1e1a14",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        fontFamily: "Inter, sans-serif",
        color: "#f2e8d5",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "18px 20px",
        borderBottom: "1px solid #1e1a14",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#e8a020" }}>
            Continuity Checker
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#3a3020" }}>
            Script doctor · finds conflicts · on-device
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid #1e1a14",
            color: "#6a5a40",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Close
        </motion.button>
      </div>

      {/* Scene inputs */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#3a3020", letterSpacing: "1px" }}>
          Paste your scenes below. Offscript will cross-reference them and find where the story breaks.
        </p>

        {scenes.map((scene, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#e8a020" }}>
                Scene {index + 1}
              </p>
              {scenes.length > 2 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => removeScene(index)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6a3020",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Remove
                </motion.button>
              )}
            </div>
            <textarea
              value={scene}
              onChange={(e) => updateScene(index, e.target.value)}
              placeholder={`Paste scene ${index + 1} here...`}
              rows={5}
              style={{
                width: "100%",
                background: "#0e0c08",
                border: "1px solid #1e1a14",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#f2e8d5",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: "1.7",
                outline: "none",
              }}
            />
          </div>
        ))}

        {/* Add scene button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addScene}
          style={{
            background: "transparent",
            border: "1px dashed #2a2010",
            color: "#6a5a40",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          + Add another scene
        </motion.button>

        {/* Error message */}
        {error && (
          <p style={{ margin: 0, fontSize: "12px", color: "#e82020" }}>{error}</p>
        )}

        {/* Check button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheck}
          disabled={loading}
          style={{
            background: loading ? "#5a4010" : "#e8a020",
            color: loading ? "#a08030" : "#0c0800",
            border: "none",
            borderRadius: "8px",
            padding: "13px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {loading ? "Analysing scenes..." : "Check continuity ›"}
        </motion.button>

        {/* Result */}
        <AnimatePresence>
          {result && (
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
                padding: "16px 20px",
              }}
            >
              <p style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#e8a020", marginBottom: "12px", marginTop: 0 }}>
                Script doctor says
              </p>
              <p style={{ fontSize: "13px", lineHeight: "1.9", color: "#c8b898", margin: 0, whiteSpace: "pre-wrap" }}>
                {result}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}