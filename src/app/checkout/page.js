"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GazeProvider } from '@/context/GazeContext.jsx';
import { useConfusionDetector } from '@/hooks/useConfusionDetector';
import { getGroqResponse } from '../actions';
import { useSupabaseLogger } from '@/hooks/useSupabaseLogger';
import CheckoutForm from "@/features/CheckoutForm";
import GazeDebugger from '@/components/GazeDebugger';
import { useGaze } from '@/context/GazeContext.jsx';

async function getGroqChatCompletion(messages) {
    return await getGroqResponse(messages);
}

const SuccessApp = () => {
    const router = useRouter();
    const { gaze, stopEyeTracking } = useGaze();
    const { saveSession } = useSupabaseLogger();

    const [needHelp, setNeedHelp] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [zones, setZones] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [cart, setCart] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, serviceFee: 15.50, total: 0 });

    useEffect(() => {
        const savedCart = localStorage.getItem("supply-cart");
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
                const sub = parsedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const tax = sub * 0.10;
                const service = 15.50;
                setTotals({
                    subtotal: sub,
                    tax: tax,
                    serviceFee: service,
                    total: sub + tax + service
                });
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        }
    }, []);


    const startTime = useRef(Date.now());
    const [gazeHistory, setGazeHistory] = useState([]);
    const [confusionLogs, setConfusionLogs] = useState([]);

    const rawConfusion = useConfusionDetector(zones);
    const [lockedConfusion, setLockedConfusion] = useState(null);

    const confusion = lockedConfusion || rawConfusion;

    useEffect(() => {
        if (!lockedConfusion && rawConfusion.isConfused) {
            setLockedConfusion(rawConfusion);
        }
    }, [rawConfusion, lockedConfusion]);
    const lastConfusionRef = useRef(null);

    const handleZoneUpdate = useCallback((newZones) => {
        setZones(newZones);
    }, []);


    useEffect(() => {
        const interval = setInterval(() => {
            if (gaze.x && gaze.y) {
                const normX = (gaze.x / window.innerWidth) * 100;
                const normY = (gaze.y / window.innerHeight) * 100;
                setGazeHistory(prev => [...prev, { x: normX, y: normY }]);
            }
        }, 200);
        return () => clearInterval(interval);
    }, [gaze]);


    useEffect(() => {
        if (confusion.isConfused) {
            setConfusionLogs(prev => [...prev, {
                zoneId: confusion.zoneId,
                reason: confusion.reason,
                timestamp: Date.now() - startTime.current
            }]);
        }
    }, [confusion.isConfused, confusion.zoneId, confusion.reason]);


    useEffect(() => {
        let timer;
        if (confusion.isConfused && !needHelp) {
            timer = setTimeout(() => {
                setShowToast(true);
            }, 4000);
        } else {
            setShowToast(false);
        }
        return () => clearTimeout(timer);
    }, [confusion.isConfused, needHelp]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, needHelp]);


    useEffect(() => {
        if (confusion.isConfused && needHelp) {
            const confusionKey = `${confusion.zoneId}-${confusion.reason}`;
            if (lastConfusionRef.current === confusionKey) return;
            lastConfusionRef.current = confusionKey;

            const triggerProactiveHelp = async () => {
                setLoading(true);
                const proactivePrompt = `
                 You are a helpful, concise Customer Assistant for an e-commerce checkout. 

        USER CONTEXT:
        - The user is currently looking at the: "${confusion?.zoneId}" section.
        - Our eye-tracker detected hesitation due to: "${confusion?.reason || 'Prolonged focus'}".
        - This means they might be confused or calculating.

        KNOWLEDGE BASE:
        1. Terms of Service: I agree to the Terms of Service, including the non-refundable processing fee of $${totals.serviceFee.toFixed(2)}, an estimated 10% tax rate, and automated subscription renewal.
        2. Price Summary: Subtotal: $${totals.subtotal.toFixed(2)}, Service Fee: $${totals.serviceFee.toFixed(2)}, Tax (10%): $${totals.tax.toFixed(2)}. Total: $${totals.total.toFixed(2)}.
        3. Cart Items: ${cart.map(i => `${i.name} - $${i.price} (Qty: ${i.quantity})`).join(", ")}.

        YOUR GOAL:
        - Acknowledge what they are looking at (e.g., "I noticed you're looking at the service fee...").
        - Explain the specific detail they are confused about using the Knowledge Base.
        - Keep answers under 3 sentences. Be human and direct.
                `;
                const systemContext = [{ role: 'system', content: proactivePrompt }];
                const response = await getGroqChatCompletion([...systemContext, ...messages]);
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                setLoading(false);
            };
            triggerProactiveHelp();
        }
    }, [confusion.isConfused, confusion.zoneId, confusion.reason, needHelp, messages]);

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
        - Our eye-tracker detected hesitation due to: "${confusion?.reason || 'Prolonged focus'}".
        - This means they might be confused or calculating.

        KNOWLEDGE BASE:
        1. Terms of Service: I agree to the Terms of Service, including the non-refundable processing fee of $${totals.serviceFee.toFixed(2)}, an estimated 10% tax rate, and automated subscription renewal.
        2. Price Summary: Subtotal: $${totals.subtotal.toFixed(2)}, Service Fee: $${totals.serviceFee.toFixed(2)}, Tax (10%): $${totals.tax.toFixed(2)}. Total: $${totals.total.toFixed(2)}.
        3. Cart Items: ${cart.map(i => `${i.name} - $${i.price} (Qty: ${i.quantity})`).join(", ")}.

        YOUR GOAL:
        - Acknowledge what they are looking at (e.g., "I noticed you're looking at the service fee...").
        - Explain the specific detail they are confused about using the Knowledge Base.
        - Keep answers under 3 sentences. Be human and direct.
      `;


        const systemContext = [{ role: 'system', content: contextualPrompt }];
        const response = await getGroqChatCompletion([...systemContext, ...newHistory]);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setLoading(false);
    };

    const handlePay = async () => {
        console.log("Processing payment and saving to Supabase...");
        const sessionData = {
            duration: Math.floor((Date.now() - startTime.current) / 1000),
            converted: true,
            confusionEvents: confusionLogs,
            gazePoints: gazeHistory,
            helpShown: messages.length > 0
        };

        const { error } = await saveSession(sessionData);

        if (!error) {
            router.push('/');
        } else {
            console.error("Database error:", error);

            router.push('/');
        }
    };

    const handleBack = async () => {
        console.log("Saving abandoned session...");
        const sessionData = {
            duration: Math.floor((Date.now() - startTime.current) / 1000),
            converted: false,
            confusionEvents: confusionLogs,
            gazePoints: gazeHistory,
            helpShown: messages.length > 0
        };

        await saveSession(sessionData);
        stopEyeTracking();
        router.push('/');
    };

    return (
        <section className="relative w-full h-screen bg-white selection:bg-blue-500">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <video
                    src="/Planet_Video.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload='auto'
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Recalibrate Button */}
            <button
                onClick={() => {
                    stopEyeTracking();
                    router.push('/calibrate');
                }}
                className="fixed bg-white/95 backdrop-blur-md text-gray-600 rounded-full shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 font-black text-[10px] uppercase tracking-widest border border-gray-100 z-30 flex items-center gap-2 p-2 top-4 left-4 md:px-6 md:py-3 md:top-8 md:left-8"
            >
                <span className="text-sm">🎯</span>
                <span className="hidden md:inline">Recalibrate</span>
            </button>

            <div className={`relative z-10 w-full h-full transition-all duration-500 overflow-y-auto lg:overflow-hidden ${needHelp ? 'pr-0 sm:pr-[35%] lg:pr-[28%]' : ''}`}>
                <div className="min-h-full w-full flex flex-col items-center justify-start lg:justify-center p-2 md:p-4 lg:p-8">

                    <div className="mb-4 md:mb-8 text-center bg-white/70 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-white/50 w-full max-w-4xl transform hover:scale-[1.01] transition-transform flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 text-black">
                        <button onClick={handleBack} className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors">
                            ← Back to Store
                        </button>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-[10px]">CG</span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">The Clarity Guardian</h1>
                            </div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none">Intelligent Secure Terminal</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 bg-white/50 px-2 md:px-3 py-1.5 rounded-full border border-gray-100">
                            <span className={`w-2 h-2 rounded-full ${confusion.isConfused ? 'bg-yellow-400 animate-pulse' : 'bg-blue-500'}`}></span>
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-500">
                                {confusion.isConfused ? 'Friction Detected' : 'Gaze Stable'}
                            </span>
                        </div>
                    </div>

                    <main className="w-full max-w-4xl relative">
                        <CheckoutForm
                            confusion={confusion}
                            onZonesReady={handleZoneUpdate}
                            onPay={handlePay}
                            onBack={handleBack}
                            cart={cart}
                            totals={totals}
                            stopEyeTracking={stopEyeTracking}
                        />

                        <GazeDebugger zones={zones} />
                    </main>

                    {!needHelp && (
                        <button
                            onClick={() => setNeedHelp(true)}
                            className="fixed bg-white/10 backdrop-blur-md text-blue-600 rounded-full shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 font-black text-xs uppercase tracking-widest border border-blue-100 flex items-center gap-3 z-30 p-3 top-4 right-4 md:px-8 md:py-4 md:top-8 md:right-8"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                            </span>

                        </button>
                    )}

                    {showToast && !needHelp && (
                        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl px-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="bg-white/90 backdrop-blur-xl border border-yellow-200/50 p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-b-yellow-400">

                                <div className="flex items-center gap-4 min-w-max">
                                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner shrink-0 text-xl animate-bounce">
                                        💡
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-black text-[10px] uppercase tracking-[0.2em] text-yellow-600">Proactive Insight</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">AI Detected Hesitation</p>
                                    </div>
                                </div>

                                <p className="text-xs font-bold text-gray-700 italic leading-relaxed text-center md:text-left">
                                    "It looks like you're hesitating on the <span className="text-blue-600 border-b border-blue-200">{confusion.reason}</span>. Would you like to clarify this?"
                                </p>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => { setNeedHelp(true); setShowToast(false); }}
                                        className="bg-blue-600 hover:bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Clarify
                                    </button>
                                    <button
                                        onClick={() => setShowToast(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="text-lg font-bold">×</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {needHelp && (
                <div className="absolute right-0 top-0 w-full sm:w-[35%] lg:w-[28%] h-full bg-white border-l border-gray-100 shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-40 flex flex-col transition-all duration-500 transform translate-x-0 animate-in slide-in-from-right overflow-hidden">

                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="font-black text-xs uppercase tracking-[0.3em] text-gray-900">Guardian Assistant</h2>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Context-Aware Analysis Active</p>
                        </div>
                        <button
                            onClick={() => setNeedHelp(false)}
                            className="bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 w-10 h-10 rounded-full flex items-center justify-center transition-all group"
                        >
                            <span className="text-xl font-bold transition-transform group-hover:rotate-90">&times;</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🤖</div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Awaiting your question...</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[90%] p-5 rounded-[1.8rem] text-xs font-bold leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none shadow-blue-200'
                                    : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-blue-50 text-blue-400 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse border border-blue-100 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                                    AI is analyzing context
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-8 bg-white border-t border-gray-50">
                        <div className='flex gap-2 items-center bg-gray-50 p-2 rounded-[2rem] border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all'>
                            <input
                                className='flex-1 p-4 bg-transparent text-gray-900 outline-none text-xs font-bold placeholder:text-gray-300'
                                placeholder="TYPE YOUR QUESTION..."
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                disabled={loading}
                            />
                            <button
                                className={`w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-black active:scale-95 transition-all flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={sendMessage}
                                disabled={loading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77+ 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[8px] text-center text-gray-300 font-bold uppercase mt-4 tracking-widest">
                            Secure Encrypted Terminal Interface
                        </p>
                    </div>
                </div>
            )}
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