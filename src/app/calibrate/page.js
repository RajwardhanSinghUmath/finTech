"use client";



const CalibrationPoint = ({ style, id, onClick, progress }) => {
    return (
        <button
            onClick={() => onClick(id)}
            className="absolute w-12 h-12 rounded-full border-2 border-white/50 backdrop-blur-sm shadow-[0_0_30px_rgba(255,0,0,0.5)] transform hover:scale-110 active:scale-95 transition-all outline-none overflow-hidden group"
            style={{
                ...style,
                background: progress >= 5 ? 'rgba(234, 179, 8, 0.9)' : 'rgba(239, 68, 68, 0.8)', zIndex: 50
            }}
        >

            <div
                className="absolute inset-0 bg-white opacity-20 transition-all duration-300 transform origin-center"
                style={{ transform: `scale(${progress / 5})` }}
            />


            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
        </button>
    );
};

import { GazeProvider } from '@/context/GazeContext.jsx';
import GazeDebugger from '@/components/GazeDebugger';
import React, { useState, useEffect } from 'react';

function CalibrateContent() {
    const [points, setPoints] = useState({
        'tl': 0, 'tc': 0, 'tr': 0,
        'cl': 0, 'cc': 0, 'cr': 0,
        'bl': 0, 'bc': 0, 'br': 0
    });

    const handlePointClick = (id) => {
        setPoints(prev => {
            const currentVal = prev[id];
            if (currentVal >= 5) return prev;
            return { ...prev, [id]: currentVal + 1 };
        });
    };

    useEffect(() => {

        const isComplete = Object.values(points).every(val => val >= 5);
        if (isComplete) {
            window.location.href = "/checkout";
        }
    }, [points]);

    const getPosition = (id) => {
        switch (id) {
            case 'tl': return { top: '40px', left: '40px' };
            case 'tc': return { top: '40px', left: '50%', transform: 'translateX(-50%)' };
            case 'tr': return { top: '40px', right: '40px' };

            case 'cl': return { top: '50%', left: '40px', transform: 'translateY(-50%)' };
            case 'cc': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
            case 'cr': return { top: '50%', right: '40px', transform: 'translateY(-50%)' };

            case 'bl': return { bottom: '40px', left: '40px' };
            case 'bc': return { bottom: '40px', left: '50%', transform: 'translateX(-50%)' };
            case 'br': return { bottom: '40px', right: '350px' };
            default: return {};
        }
    };

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
            <GazeDebugger zones={[]} />


            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <video
                    src="/Planet_Video.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
            </div>


            {Object.keys(points).map((key) => (
                <CalibrationPoint
                    key={key}
                    id={key}
                    progress={points[key]}
                    onClick={handlePointClick}
                    style={getPosition(key)}
                />
            ))}


            {points['cc'] < 5 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20 text-center pointer-events-none z-0">
                    <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-bold animate-pulse">
                        Click each point 5 times
                    </p>
                </div>
            )}
            <button
                onClick={() => window.location.href = "/checkout"}
                className="fixed bottom-48 right-8 z-[100] bg-white text-black px-6 py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors flex items-center gap-2 group shadow-lg"
            >
                Skip Calibration
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
        </div>
    );
}

export default function CalibratePage() {
    return (
        <GazeProvider>
            <CalibrateContent />
        </GazeProvider>
    );
}
