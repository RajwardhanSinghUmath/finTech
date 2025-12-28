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

import { GazeProvider, useGaze } from '@/context/GazeContext.jsx';
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

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getPosition = (id) => {
        const margin = isMobile ? '20px' : '40px';
        const topMargin = isMobile ? '80px' : '40px';
        const cornerOffset = isMobile ? '20px' : '220px';

        switch (id) {
            case 'tl': return { top: isMobile ? '60px' : topMargin, left: isMobile ? '10px' : cornerOffset };
            case 'tc': return { top: topMargin, left: '50%', transform: 'translateX(-50%)' };
            case 'tr': return { top: topMargin, right: margin };

            case 'cl': return { top: '50%', left: margin, transform: 'translateY(-50%)' };
            case 'cc': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
            case 'cr': return { top: '50%', right: margin, transform: 'translateY(-50%)' };

            case 'bl': return { bottom: margin, left: margin };
            case 'bc': return { bottom: margin, left: '50%', transform: 'translateX(-50%)' };
            case 'br': return { bottom: isMobile ? '50px' : margin, right: isMobile ? '50px' : (isMobile ? margin : '350px') };
            default: return {};
        }
    };

    const { webcamStream } = useGaze();
    const videoRef = React.useRef(null);

    useEffect(() => {
        if (videoRef.current && webcamStream) {
            videoRef.current.srcObject = webcamStream;
        }
    }, [webcamStream]);

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
            <GazeDebugger zones={[]} />

            {/* Camera Feed */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 w-32 h-24 md:w-48 md:h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-40 pointer-events-none bg-black/50 backdrop-blur-sm">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1] opacity-80"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-lg m-2" />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                    <p className="text-[8px] text-white/50 uppercase tracking-widest font-mono">Face Here</p>
                </div>
            </div>

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
                className="fixed bottom-8 right-4 md:bottom-48 md:right-8 z-[100] bg-white text-black px-4 py-3 md:px-6 md:py-4 rounded-xl text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors flex items-center gap-2 group shadow-lg"
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
