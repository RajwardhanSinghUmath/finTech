"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from "next/link";
import { BsBagCheckFill } from "react-icons/bs";
import { GazeProvider } from '@/context/GazeContext.jsx';
import { useConfusionDetector } from '@/hooks/useConfusionDetector';
import { getGroqResponse } from '../../actions';
import CheckoutForm from "@/features/CheckoutForm"
async function getGroqChatCompletion(messages) {
    return await getGroqResponse(messages);
}

const SuccessApp = () => {
    const [needHelp, setNeedHelp] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Clear cart on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("supply-cart");
        }
    }, []);

    const handleZoneUpdate = useCallback((newZones) => {
        setZones(newZones);
    }, []);

    // Zones for success page (minimal, allowing gaze tracking to function without specific targets)
    const [zones, setZones] = useState([
        { id: 'success-card', left: 0, right: 0, top: 0, bottom: 0 }
    ]);
    const confusion = useConfusionDetector(zones);
    const lastConfusionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, needHelp]);

    // Proactive Confusion Trigger (Adapted for Success Page)
    useEffect(() => {
        if (confusion.isConfused) {
            const confusionKey = `${confusion.zoneId}-${confusion.reason}`;
            if (lastConfusionRef.current === confusionKey) return;

            lastConfusionRef.current = confusionKey;
            setNeedHelp(true);

            const triggerProactiveHelp = async () => {
                setLoading(true);
                const proactivePrompt = `
          You are a helpful assistant for Clarity Guardian on the Order Success page.
          The user seems confused.
          Simply ask if they have any questions about their order or shipping.
          Keep it short and friendly.
        `;
                const systemContext = [{ role: 'system', content: proactivePrompt }];
                const response = await getGroqChatCompletion([...systemContext, ...messages]);
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                setLoading(false);
            };
            triggerProactiveHelp();
        }
    }, [confusion.isConfused, confusion.zoneId, confusion.reason, messages]);

    const sendMessage = async () => {
        if (!inputVal.trim()) return;

        const userMsg = { role: 'user', content: inputVal };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInputVal("");
        setLoading(true);

        const contextualPrompt = `
        You are a helpful, concise Customer Assistant for an e-commerce checkout. 

        USER CONTEXT:
        - The user is currently looking at the: "${confusion?.zoneId}" section.
        - Our eye-tracker detected confusion due to: "${confusion?.reason}".

        KNOWLEDGE BASE:
        1. Terms of Service: I agree to the Terms of Service, including the non-refundable processing fee of $12.40 and automated subscription renewal.
        2. Price Summary: Subtotal: $120.00, Service Fee: $15.50, Tax: $8.40. Total: $143.90.

        YOUR GOAL:
        - Acknowledge what they are looking at (e.g., "I noticed you're looking at the service fee...").
        - Explain the specific detail they are confused about using the Knowledge Base.
        - Keep answers under 3 sentences. Do not use "AI assistant" cliches. Be human and direct.
        - If they are looking at the 'terms-cond', clarify the non-refundable fee or renewal.
        - If they are looking at 'price-summary', explain the $143.90 breakdown.

        USER QUESTION: "${inputVal}"
      `;
        const systemContext = [{ role: 'system', content: contextualPrompt }];
        const response = await getGroqChatCompletion([...systemContext, ...newHistory]);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setLoading(false);
    };

    return (
        <section className="relative w-full h-screen bg-white overflow-hidden">
      <div className='w-full h-screen z-0 absolute'>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video
            src="/Planet_Video.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload='auto'
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto">
          <div className="min-h-screen w-full max-w-4xl p-8 flex flex-col items-center justify-center">

            <header className="mb-8 text-center bg-white/60 backdrop-blur-[1px] p-6 rounded-2xl shadow-sm border border-white/50 w-full">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">The Clarity Guardian</h1>
              <p className="text-gray-600">Smart Payment Confusion Detector</p>
            </header>

            <main className="w-full relative">
              <CheckoutForm
                confusion={confusion}
                onZonesReady={handleZoneUpdate}
              />

              {/* <GazeDebugger zones={zones} /> */}

            </main>

            <button
              onClick={(e) => {
                e.preventDefault();
                setNeedHelp(true);
              }}
              className='absolute top-4 right-4 bg-blue-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors'>
              NEED HELP?
            </button>
            {confusion.isConfused && (
              <div className="fixed top-10 left-1/2 -translate-x-1/2 animate-bounce bg-yellow-50 border-1 border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 backdrop-blur-md">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide text-yellow-600">Clarity Insight</p>
                  <p>It looks like you're hesitating on the <strong>{confusion.reason}</strong>.</p>
                </div>
              </div>
            )}
          </div>

        </div>
        {needHelp && (
          <div className='absolute right-0 top-0 w-full sm:w-1/3 md:w-1/4 h-screen bg-white/95 backdrop-blur-xl border-l border-gray-200 shadow-2xl z-50 flex flex-col transition-all duration-300'>

            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-600/5">
              <h2 className="font-semibold text-gray-800">Support Assistant</h2>
              <button
                onClick={() => setNeedHelp(false)}
                className="text-gray-400 hover:text-red-500 transition-colors text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-100 text-gray-400 px-4 py-2 rounded-2xl text-xs animate-pulse">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className='flex gap-2 items-center'>
                <input
                  className='flex-1 p-3 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm'
                  placeholder="Ask for help..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={loading}
                />
                <button
                  className={`p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={sendMessage}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
    );
};

export default function App() {
    return (
        <GazeProvider>
            <SuccessApp />
        </GazeProvider>
    );
}
