"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, Link } from 'next/navigation';
import { clsx } from 'clsx';
import { Content } from 'next/font/google';
import { ArrowRight } from 'lucide-react';
import { GazeProvider, useGaze } from '@/context/GazeContext.jsx';



const SuccessApp = () => {
    const router = useRouter();
    const { updateConsent } = useGaze();
    const [consent, setContent] = useState(false)
    const [isdisabled, setIsDisabled] = useState(false)

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

            <div className='absolute top-[50%] left-[50%] h-150 w-240 overflow-hidden rounded-4xl bg-white/80 shadow-2xl -translate-x-1/2 -translate-y-1/2 '>
                <div className="w-full h-full flex flex-col bg-white">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Terms of Service & Privacy Notice</h2>
                        <p className="text-xs text-gray-500 mt-1">Last Updated: December 27, 2025</p>
                    </div>

                    {/* Scrollable Legal Text */}
                    <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-600 leading-relaxed space-y-6 custom-scrollbar">

                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">1. Introduction</h3>
                            <p>
                                Welcome to the Proactive Insight System ("The Feature"). By enabling this feature, you grant the application permission to access your device's webcam for the sole purpose of enhancing your user experience through eye-tracking technology. Please read these terms carefully before proceeding.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">2. How It Works</h3>
                            <p>
                                The Feature utilizes advanced computer vision algorithms to detect your gaze coordinates on the screen. This allows the application to identify when you may be hesitating or focusing on specific elements for an extended period, triggering contextual assistance (e.g., "Proactive Insight" popups).
                            </p>
                        </section>

                        <section className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 text-xs uppercase tracking-wider">3. Privacy & Data Processing (Crucial)</h3>
                            <p className="mb-3">
                                Your privacy is our paramount concern. We adhere to a strict <strong>Local-Only Processing</strong> policy:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-1 text-blue-800/80">
                                <li><strong>No Cloud Storage:</strong> Video feeds are processed exclusively within your browser's memory (RAM).</li>
                                <li><strong>No Transmission:</strong> No video data, images, or biometric identifiers are ever transmitted to external servers, cloud databases, or third parties.</li>
                                <li><strong>Ephemeral Data:</strong> The mathematical coordinates of your gaze are calculated in real-time and immediately discarded after use. We do not build a profile of your browsing habits.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">4. User Control & Revocation</h3>
                            <p>
                                You retain full control over this feature at all times:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Pause/Resume:</strong> You may pause eye-tracking instantly by clicking the "Eye Icon" indicator in the bottom corner of your screen.</li>
                                <li><strong>Permanent Opt-Out:</strong> You may disable camera permissions via your browser settings or the application settings menu at any time.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">5. Security</h3>
                            <p>
                                The video stream is sandboxed within your browser's secure context. The application cannot access your camera when the tab is closed or minimized. We utilize standard WebRTC protocols to ensure a secure handshake between your hardware and the browser.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">6. Limitations</h3>
                            <p>
                                The eye-tracking technology relies on adequate lighting and standard positioning. We do not guarantee 100% accuracy in gaze detection. This feature is provided "as is" and is intended for assistance purposes only; it should not be relied upon for critical accessibility needs without secondary verification.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">7. Consent Acknowledgement</h3>
                            <p>
                                By clicking "Allow Camera Access," you explicitly consent to the real-time local processing of your facial data for the purposes described above. You confirm that you understand no video data is stored or shared.
                            </p>
                        </section>

                        {/* Footer Filler for "Big" feel */}
                        <div className="pt-8 border-t border-gray-100 mt-8">
                            <p className="text-xs text-gray-400 text-center">
                                End of Document<br />
                                Reference ID: PRIV-EYE-2025-V4
                            </p>
                        </div>

                    </div>
                    <div className='w-full flex flex-row py-4 items-center justify-around'>
                        <label className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={() => setContent(!consent)}
                                    className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-md checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer"
                                />

                                {/* Checkmark Icon (Only visible when checked) */}
                                <svg
                                    className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>

                            <span
                                className={clsx(
                                    "text-sm font-bold uppercase tracking-wider transition-colors",
                                    consent ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"
                                )}
                            >
                                Give Consent
                            </span>
                        </label>
                        <button
                            onClick={() => {
                                updateConsent(consent);
                                router.push(consent ? "/calibrate" : "/checkout");
                            }}
                            className={clsx(
                                "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-white transition-all duration-300",
                                consent
                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                                    : "bg-black hover:bg-gray-800 shadow-lg shadow-gray-200"
                            )}
                        >
                            <span className="z-10 relative">
                                {consent ? "Use Eyes & Calibrate" : "Use Mouse to Checkout"}
                            </span>
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const PrivacyPage = () => {
    return (
        <GazeProvider>
            <SuccessApp />
        </GazeProvider>
    );
};

export default PrivacyPage;