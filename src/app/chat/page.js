'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Welcome! Feel free to ask me anything about your uploaded datasets or collections.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const isFirstRender = useRef(true);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const { reply } = await res.json();
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error: ' + (err.message || err) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="relative flex flex-col h-screen bg-gray-50">
      {/* Absolute SVG in top‑right, matching header's padding (p-6 → top-6 right-6) */}
      <a
        href="https://console-preview.neo4j.io/login"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 flex flex-col items-center space-y-3 md-space-x-1"
      >
        <img
          src="/graph_view.svg"
          alt="Inspect graph in Neo4j"
          className="h-12 w-12 md:h-30 md:w-30" 
        />
        <span className="text-xs md:text-base text-gray-600 whitespace-nowrap">
          Inspect in <span className="text-brand">Neo4j</span> 👆
        </span>
      </a>

      {/* Centered column for header + chat */}
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        {/* Header */}
        <header className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Chat with your data
          </h1>
        </header>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl px-4 py-2 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-brand text-white'
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-xl px-4 py-2 rounded-xl bg-white text-gray-500 shadow animate-pulse">
                Thinking...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Sticky input bar at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex w-full max-w-2xl mx-auto space-x-4 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={6}
            className="flex-1 h-32 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-brand focus:ring-2 resize-none"
            placeholder="Enter your question..."
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-brand text-white rounded-full hover:bg-brand-dark transition disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
