// ScriptLibrary — Chapter 4 of Kofi's story
// Every script Kofi generates is saved here automatically
// Searchable, private, lives entirely on his device

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STORAGE_KEY = "offscript_library"

// Save a new entry to localStorage
export function saveToLibrary(prompt, response, type) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  const entry = {
    id: Date.now(),
    prompt,
    response,
    type: type || "Script",
    savedAt: new Date().toISOString(),
  }
  const updated = [entry, ...existing]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

// --- SCRIPT LIBRARY PANEL ---
export default function ScriptLibrary({ onLoad, onClose }) {
  const [scripts, setScripts] = useState([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)

  // Load all saved scripts from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    setScripts(stored)
  }, [])

  // Filter by search term
  const filtered = scripts.filter(
    (s) =>
      s.prompt.toLowerCase().includes(search.toLowerCase()) ||
      s.response.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  function deleteScript(id) {
    const updated = scripts.filter((s) => s.id !== id)
    setScripts(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    if (selected?.id === id) setSelected(null)
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
        width: "420px",
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
            Script Library
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#3a3020" }}>
            {scripts.length} saved · private · on-device
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

      {/* Search */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1a14" }}>
        <input
          type="text"
          placeholder="Search your scripts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#0e0c08",
            border: "1px solid #1e1a14",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#f2e8d5",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* List + Detail */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Script list */}
        <div style={{
          width: selected ? "45%" : "100%",
          overflowY: "auto",
          borderRight: selected ? "1px solid #1e1a14" : "none",
          transition: "width 0.3s ease",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#3a3020" }}>
              <p style={{ fontSize: "13px" }}>
                {scripts.length === 0
                  ? "No scripts saved yet.\nGenerate something and it will appear here."
                  : "No results found."}
              </p>
            </div>
          ) : (
            filtered.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ backgroundColor: "#0e0c08" }}
                onClick={() => setSelected(s)}
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #1a1610",
                  cursor: "pointer",
                  background: selected?.id === s.id ? "#130f08" : "transparent",
                  borderLeft: selected?.id === s.id ? "3px solid #e8a020" : "3px solid transparent",
                }}
              >
                <p style={{
                  margin: "0 0 4px",
                  fontSize: "12px",
                  color: "#c8b898",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {s.prompt}
                </p>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{
                    fontSize: "10px",
                    color: "#e8a020",
                    background: "#1a1200",
                    border: "1px solid #2a1e00",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    letterSpacing: "1px",
                  }}>
                    {s.type}
                  </span>
                  <span style={{ fontSize: "10px", color: "#3a3020" }}>{formatDate(s.savedAt)}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Script detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "11px", color: "#6a5a40", lineHeight: 1.6 }}>
                {selected.prompt}
              </p>
              <div style={{
                background: "#0e0c08",
                border: "1px solid #2a2010",
                borderLeft: "3px solid #e8a020",
                borderRadius: "8px",
                padding: "14px",
                flex: 1,
              }}>
                <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.8, color: "#c8b898", whiteSpace: "pre-wrap" }}>
                  {selected.response}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onLoad(selected.prompt, selected.response); onClose(); }}
                  style={{
                    flex: 1,
                    background: "#e8a020",
                    color: "#0c0800",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Load into editor
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => deleteScript(selected.id)}
                  style={{
                    background: "transparent",
                    color: "#6a3020",
                    border: "1px solid #2a1010",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}