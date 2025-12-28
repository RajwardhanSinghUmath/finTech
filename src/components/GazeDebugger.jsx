"use client"
import { useGaze } from '../context/GazeContext.jsx';
import { useConfusionDetector } from '../hooks/useConfusionDetector';
import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import clsx from 'clsx';
import { useRouter } from 'next/navigation.js';

const GazeDebugger = ({ zones }) => {
  const router = useRouter();
  const { gaze, isMouseSim, setIsMouseSim } = useGaze();
  const isEyeTracking = !isMouseSim;
  const setIsEyeTracking = (track) => setIsMouseSim(!track);
  const confusion = useConfusionDetector(zones);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Accessibility: Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Press '?' to toggle help (placeholder)
      if (e.key === '?') {
        e.preventDefault();
        console.log('Help shortcut triggered');
      }
      // Press 'T' to toggle tracking mode
      if (e.key === 'T' || e.key === 't') {
        setIsEyeTracking(!isEyeTracking);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEyeTracking, setIsEyeTracking]);

  // Dynamic Styles based on state
  const theme = {
    color: confusion.isConfused ? 'text-rose-500' : 'text-emerald-400',
    border: confusion.isConfused ? 'border-rose-500' : 'border-emerald-400',
    bg: confusion.isConfused ? 'bg-rose-500' : 'bg-emerald-400',
    glow: confusion.isConfused ? 'shadow-[0_0_30px_rgba(244,63,94,0.6)]' : 'shadow-[0_0_20px_rgba(52,211,153,0.4)]',
  };

  // Hide default cursor when simulating with mouse
  useEffect(() => {
    if (isMouseSim) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isMouseSim]);

  return (
    <>
      <div
        className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out will-change-transform"
        style={{
          left: gaze.x,
          top: gaze.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer Ring (Expands/Pulses when confused) */}
        <div
          className={`absolute inset-0 w-12 h-12 -ml-2 -mt-2 rounded-full border-2 opacity-60 
            ${theme.border} ${confusion.isConfused ? 'animate-ping' : 'scale-100'} transition-colors duration-300`}
        />

        {/* Inner Crosshair / Dot */}
        <div className={`w-8 h-8 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center ${theme.glow}`}>
          <div className={`w-2 h-2 rounded-full ${theme.bg}`} />
        </div>

      </div>

      {isMobile
        ?
        (
          <>
            <button
              onClick={() => router.push('/calibrate')}
              className={clsx(
                "fixed bg-white/95 backdrop-blur-md text-gray-600 rounded-full shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 font-black text-[10px] uppercase tracking-widest border border-gray-100 z-30 flex items-center gap-2",
                isMobile ? "p-3 bottom-4 left-4" : "px-6 py-3 top-8 left-8"
              )}
            >
              <span className="text-sm">🎯</span>
              <span className="sr-only">Recalibrate</span>
            </button>
            <button
              onClick={() => setIsEyeTracking(!isEyeTracking)}
              className={`fixed bottom-4 right-4 inline-flex h-10 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 border-2 border-white/20 shadow-xl ${isEyeTracking ? 'bg-purple-600' : 'bg-slate-800'
                }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${isEyeTracking ? 'translate-x-8' : 'translate-x-1'
                  }`}
              />
            </button>
          </>
        )
        :
        (
          <div className="fixed bottom-6 right-6 w-80 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden font-sans z-[10000] text-slate-200">

            {/* Header */}
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex justify-between items-center">
              {isEyeTracking ? (
                <p className="text-xs font-bold text-slate-300">
                  We use your <strong className='text-red-500'>camera</strong> to detect where you're looking and provide help. No images are stored. You can disable this anytime.
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-300">
                  We use your <strong className='text-emerald-500'>mouse</strong> to detect where you're looking and provide help. No images are stored. You can disable this anytime.
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Input Toggle Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Input Source</span>
                  <span className="text-[10px] text-slate-500">
                    {isEyeTracking ? 'Tracking via Webcam' : 'Simulating via Mouse'}
                  </span>
                </div>

                <button
                  onClick={() => setIsEyeTracking(!isEyeTracking)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isEyeTracking ? 'bg-purple-600' : 'bg-slate-600'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${isEyeTracking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

            </div>
          </div>
        )
      }
    </>
  );
};

export default GazeDebugger;