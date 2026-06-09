"use client";

import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi there! I am your TripManager AI 🌍. Ask me about your upcoming trips, cancellations, or general travel advice!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "📅 What is my next trip?",
    "❌ Do I have cancelled trips?",
    "🎒 What to pack for a beach?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 1. Add the textOverride parameter
  const handleSend = async (textOverride?: string) => {
    // 2. Use the override if it exists, otherwise use the input state
    const currentInput = typeof textOverride === 'string' ? textOverride : input;
    
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput(""); // Clear the box
    setIsLoading(true);

    // ==========================================
    // STEP 1: FETCH THE USER'S DATABASE RECORD
    // ==========================================
    let userDatabaseInfo = "No booking data found or user is not logged in.";
    
    try {
      const token = localStorage.getItem("token"); 
      const user = JSON.parse(localStorage.getItem("user") || "{}"); // Get the user object

      // Only fetch if we have both the token and the user ID
      if (token && user.id) {
        // Updated URL to match your Dashboard exact route!
        const res = await fetch(`http://localhost:8000/api/bookings/${user.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        // Ensure we actually got JSON back before parsing
        if (res.ok) {
          const data = await res.json();
          // Adjusting based on how your dashboard reads it (sometimes it's just data, sometimes data.data)
          const actualData = data.data ? data.data : data; 
          
          if (Array.isArray(actualData) && actualData.length > 0) {
            userDatabaseInfo = JSON.stringify(actualData);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch context for AI:", error);
    }

    // ==========================================
    // STEP 2: FEED EVERYTHING TO GEMINI
    // ==========================================
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are an expert travel assistant for "TripManager".
        
        CURRENT LOGGED-IN USER'S DATABASE RECORD:
        ${userDatabaseInfo}

        RULES:
        1. If the user asks about their own trips, bookings, cancellations, or refunds, read the JSON database record above and answer accurately based ONLY on that data.
        2. Format dates nicely. Mention trip names, statuses, and prices if relevant.
        3. If the database record says "No booking data found", tell them they don't have any current trips on file.
        4. If they ask a general travel question (like "what to pack"), ignore the database and answer normally.
        5. Keep answers friendly, conversational, and concise (2-4 sentences).
        6. AGENTIC UI CONTROL: If the user explicitly asks to cancel a specific trip, find that trip's ID in the database and append this exact string to your response: [[ACTION:CANCEL, ID:X]] (Replace X with the real ID).

        User asks: "${userMessage}"
      `;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();

      // ==========================================
      // AGENTIC ACTION INTERCEPTOR
      // ==========================================
      const actionMatch = responseText.match(/\[\[ACTION:CANCEL,\s*ID:(\d+)\]\]/i);
      
      if (actionMatch) {
        const bookingId = parseInt(actionMatch[1], 10);
        
        // 1. Shout into the browser window that the AI wants to cancel a trip!
        window.dispatchEvent(new CustomEvent("ai_trigger_cancel", { detail: { bookingId } }));
        
        // 2. Scrub the secret code out of the text so the user never sees it
        responseText = responseText.replace(/\[\[ACTION:CANCEL,\s*ID:\d+\]\]/ig, "").trim();
      } 

      setMessages((prev) => [...prev, { role: "bot", text: responseText }]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      // Check if it's a 503 Traffic Jam error
      if (error.message && error.message.includes("503")) {
        setMessages((prev) => [...prev, { role: "bot", text: "Google's AI servers are currently experiencing high traffic! 🚦 Give me just a few seconds and try asking again." }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: "Oops! My AI brain lost connection to the server. Please try asking again." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Inline Styles for Markdown Formatting */}
      <style>{`
        .markdown-body p {
          margin-top: 0;
          margin-bottom: 8px;
        }
        .markdown-body p:last-child {
          margin-bottom: 0;
        }
        .markdown-body ul, .markdown-body ol {
          margin-top: 0;
          margin-bottom: 8px;
          padding-left: 20px;
        }
        .markdown-body strong {
          color: #0f172a;
        }
        /* Custom scrollbar for chips to make them sleek */
        .chips-container::-webkit-scrollbar {
          height: 4px;
        }
        .chips-container::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: "30px", right: "30px", width: "60px", height: "60px",
          borderRadius: "50%", background: "#2563eb", color: "white", border: "none",
          boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.4)", cursor: "pointer",
          display: "flex", justifyContent: "center", alignItems: "center", fontSize: "28px", zIndex: 9999,
          transition: "transform 0.2s"
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", bottom: "100px", right: "30px", width: "350px", height: "550px",
          background: "white", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9999, border: "1px solid #e2e8f0"
        }}>
          <div style={{ background: "#1e40af", color: "white", padding: "15px 20px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span> Personalized AI Agent
          </div>

          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", background: "#f8fafc" }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "#2563eb" : "white",
                color: msg.role === "user" ? "white" : "#334155",
                padding: "10px 14px", borderRadius: "12px", maxWidth: "85%",
                boxShadow: msg.role === "bot" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                fontSize: "14px", lineHeight: "1.5", border: msg.role === "bot" ? "1px solid #e2e8f0" : "none",
                whiteSpace: msg.role === "user" ? "pre-wrap" : "normal"
              }}>
                {msg.role === "bot" ? (
                  <div className="markdown-body" style={{ margin: 0 }}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: "flex-start", background: "white", color: "#64748b", padding: "10px 14px", borderRadius: "12px", fontSize: "14px", border: "1px solid #e2e8f0" }}>
                Checking database...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Area */}
          <div className="chips-container" style={{ padding: "10px 15px", display: "flex", gap: "8px", overflowX: "auto", borderTop: "1px solid #e2e8f0", background: "#f8fafc", whiteSpace: "nowrap" }}>
            {suggestions.map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(text)}
                disabled={isLoading}
                style={{
                  padding: "6px 12px", background: "white", border: "1px solid #cbd5e1", 
                  borderRadius: "16px", fontSize: "12px", color: "#475569", cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
                onMouseOut={(e) => e.currentTarget.style.background = "white"}
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: "10px 15px 15px", background: "white", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your trips..."
              style={{ flex: 1, padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "8px", padding: "0 15px", cursor: isLoading || !input.trim() ? "not-allowed" : "pointer", fontWeight: "bold" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}