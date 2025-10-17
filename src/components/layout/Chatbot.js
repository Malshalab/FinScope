"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "You said: " + input },
      ]);
    }, 500);
    setInput("");
  };

  return (
    <div className="flex h-80 w-full flex-col rounded-3xl border border-slate-900/50 bg-gradient-to-br from-slate-950 via-slate-950/70 to-slate-900/60 p-4 text-sm text-slate-200 sm:h-96 sm:p-6">
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-blue-200/70">FinScope copilot</p>
          <p className="text-sm font-medium text-white">Ask anything about your money</p>
        </div>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-100">Live</span>
      </div>
      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.from === "bot" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm font-medium shadow ${
                msg.from === "bot"
                  ? "bg-slate-900/80 text-slate-200 border border-slate-800"
                  : "bg-blue-500/80 text-white border border-blue-400/40"
              }`}
            >
              <span className="font-bold mr-1">{msg.from === "bot" ? "Bot:" : "You:"}</span> {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-slate-200 shadow-inner shadow-blue-900/20 focus:border-blue-400 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
        />
        <button
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:brightness-110"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
