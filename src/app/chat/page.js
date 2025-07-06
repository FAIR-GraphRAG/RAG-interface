'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ExpandableKeyValue from '@/components/Expandable';
import Image from 'next/image'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Welcome! Feel free to ask me anything about your uploaded dataset.' },
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
      const data = await res.json();
      const reply = data?.reply;

      if (reply) {
        setMessages(prev => [...prev, { ...reply, context: reply.context }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ No reply from server.' }]);
      }
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
        className="absolute top-1 right-10 flex flex-col items-center space-y-3 md-space-x-1"
      >
        <img
          src="/graph_view3.svg"
          alt="Inspect graph in Neo4j"
          className="h-12 w-12 md:h-30 md:w-30" 
        />
        <span className="text-xs md:text-base text-gray-600 whitespace-nowrap">
          <span className="text-brand">Inspect in Neo4j</span> 👆
        </span>
      </a>

      {/* Centered column for header + chat */}
      <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto">
        {/* Header */}
        <header className="p-2">
          <h1 className="text-3xl font-semibold text-gray-800">
            Chat with your data
          </h1>
        </header>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-3xl px-4 py-2 rounded-xl ${
                  msg.role === 'user' ? 'bg-brand text-white' : 'bg-white text-gray-800 shadow'
                }`}
              >
                <div>{msg.content}</div>

                {/* Example questions right after the welcome message */}
                {i === 0 && msg.role === 'assistant' && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-600 font-medium">Example questions:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'What is the biotype of the gene TSPAN6?',
                        'Which gene shows the largest difference in expression (fold change) between Group A and Group B?',
                        'What is the sequencing instrument used for this study?',
                        'What is the chromosome ontology name for the gene CD38?',
                      ].map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(question)}
                          className="bg-gray-200 text-sm text-gray-800 rounded-full px-4 py-2 hover:bg-gray-300 transition"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cypher Query (collapsible) */}
                {msg.context?.cypher?.query && (
                  <details className="mt-2 text-md text-gray-600">
                    <summary className="cursor-pointer font-semibold text-sm">Cypher Query</summary>
                    <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap text-[11px]">
                      {msg.context.cypher.query}
                    </pre>
                  </details>
                )}
                {/* Node Data (collapsible) */}
                {Array.isArray(msg.context?.nodeData) && msg.context.nodeData.length > 0 && (
                <details className="mt-2 text-md text-gray-600">
                  <summary className="cursor-pointer font-semibold text-sm flex items-center">
                    ▸ FAIR Digital Object Data&nbsp;
                      <Image
                        src="/FDO1.png"
                        alt="FDO"
                        width={23}
                        height={23}
                        className="mr-1"
                      />
                  </summary>
                  <ul className="mt-1 space-y-4">
                    {msg.context.nodeData.map((node, idx) => {
                      try {
                        if (!node) return null;
                        const sortedProps = Object.keys(node.properties || {})
                          .sort()
                          .reduce((acc, key) => {
                            acc[key] = node.properties[key];
                            return acc;
                          }, {});

                        return (
                          <li key={idx} className="bg-gray-100 p-4 rounded text-md">
                            <div className="mb-2 font-mono text-gray-500">PID: {node.properties.pid}</div>
                            <div className="mb-2 font-mono text-gray-500">Labels: [{node.labels.join(', ')}]</div>
                            <div className="space-y-1">
                              {Object.entries(sortedProps).map(([key, value]) => (
                                <ExpandableKeyValue key={key} label={key} value={value} />
                              ))}
                            </div>
                          </li>
                        );
                      } catch (error) {
                        // Optionally, you can log or display a friendly error message
                        console.error(`Error rendering node at index ${idx}:`, error);
                        return (
                          <li key={idx} className="bg-red-100 p-4 rounded text-md text-red-500">
                            Error rendering node at index {idx}
                          </li>
                        );
                      }
                    })}
                  </ul>
                </details>
              )}


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
