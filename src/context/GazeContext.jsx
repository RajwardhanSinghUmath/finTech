import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const GazeContext = createContext();

export const GazeProvider = ({ children }) => {
  const [gaze, setGaze] = useState({ x: 0, y: 0, timestamp: 0 });
  const [isMouseSim, setIsMouseSim] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Refs for MediaPipe and Video management
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const requestRef = useRef(null); // To cancel animation frame
  const streamRef = useRef(null); // To stop webcam
  const lastVideoTimeRef = useRef(-1);
  const lastTimestampRef = useRef(-1);
  const prevGazeRef = useRef({ x: 0, y: 0 });

  // --- MOUSE SIMULATION ---
  useEffect(() => {
    if (isMouseSim) {
      const handleMouseMove = (e) => {
        setGaze({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        stopEyeTracking(); // Ensure camera stops if we switch modes
      };
    }
  }, [isMouseSim]);

  // --- EYE TRACKING LOGIC ---
  useEffect(() => {
    if (!isMouseSim) {
      startEyeTracking();
    }
    return () => {
      stopEyeTracking();
    };
  }, [isMouseSim]);

  const startEyeTracking = async () => {
    // 1. Load Model if not already loaded
    if (!faceLandmarkerRef.current) {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
        return;
      }
    }

    // 2. Start Webcam
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Camera API not available. Ensure you are on HTTPS or localhost.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for metadata to ensure dimensions are ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          requestRef.current = requestAnimationFrame(predictWebcam);
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopEyeTracking = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
      setIsModelLoaded(false);
    }
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const landmarker = faceLandmarkerRef.current;

    if (
      video &&
      landmarker &&
      video.readyState >= 2 && // HAVE_CURRENT_DATA
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !video.paused &&
      !video.ended &&
      landmarker // Extra check
    ) {
      // Avoid processing the same frame multiple times
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        try {
          let startTimeMs = performance.now();

          // MediaPipe VIDEO mode requires strictly increasing timestamps
          if (startTimeMs <= lastTimestampRef.current) {
            startTimeMs = lastTimestampRef.current + 0.01;
          }
          lastTimestampRef.current = startTimeMs;

          const results = landmarker.detectForVideo(video, startTimeMs);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            // --- 1. Get Iris Indices ---
            const leftIris = landmarks[468];
            const rightIris = landmarks[473];

            // --- 2. Calculate Average Iris Position ---
            const avgIrisX = (leftIris.x + rightIris.x) / 2;
            const avgIrisY = (leftIris.y + rightIris.y) / 2;

            // --- 3. Define Active Zone (Sensitivity Box) ---
            // Adjust these to make it easier/harder to reach corners
            // 0.15 is a balanced sensitivity (smaller - more sensitive)
            const boxWidth = 0.1;
            const boxHeight = 0.025;

            // Vertical Offset to compensate for "Webcam on Top" angle (Laptop standard).
            // Positive value shifts the "center" of the screen DOWN in camera space,
            // which effectively moves the cursor UP for the same eye position.
            const yOffset = 0.12;

            // Center of camera is 0.5, 0.5
            const minX = 0.5 - (boxWidth / 2);
            const maxX = 0.5 + (boxWidth / 2);
            const minY = (0.5) - (boxHeight / 2);
            const maxY = (0.5 + yOffset) + (boxHeight / 2);

            // --- 4. Map to Screen Coordinates ---
            let normalizedX = (avgIrisX - minX) / (maxX - minX);
            let normalizedY = (avgIrisY - minY) / (maxY - minY);

            // Clamp values to 0-1
            normalizedX = Math.max(0, Math.min(1, normalizedX));
            normalizedY = Math.max(0, Math.min(1, normalizedY));

            // Calculate Target Screen Pixels (Mirror X)
            const targetX = (1 - normalizedX) * window.innerWidth;
            const targetY = normalizedY * window.innerHeight;

            // --- 5. Apply Smoothing (Holt's Linear Trend / Simple Lerp) ---
            const SMOOTHING_FACTOR = 0.1; // 0.1 = Very Smooth, 0.9 = Very Reactive

            const smoothX = prevGazeRef.current.x + (targetX - prevGazeRef.current.x) * SMOOTHING_FACTOR;
            const smoothY = prevGazeRef.current.y + (targetY - prevGazeRef.current.y) * SMOOTHING_FACTOR;

            prevGazeRef.current = { x: smoothX, y: smoothY };

            // --- 6. Update Context State ---
            setGaze({
              x: smoothX,
              y: smoothY,
              // Optional: Calculate Eye Distance for Z-axis
              distance: Math.sqrt(
                Math.pow((leftIris.x - rightIris.x), 2) +
                Math.pow((leftIris.y - rightIris.y), 2)
              )
            });
          }
        } catch (error) {
          console.error("MediaPipe detection error:", error);
          // If a fatal error occurs, stop the loop to prevent freezing
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
          return;
        }
      }
    }

    if (!isMouseSim) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  return (
    <GazeContext.Provider value={{ gaze, isMouseSim, setIsMouseSim, isModelLoaded }}>
      {children}

      {/* Hidden Video Element for MediaPipe Processing */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0, // Hidden from view, but active in DOM
          pointerEvents: "none",
          zIndex: -1,
          transform: "scaleX(-1)" // Mirror for consistency
        }}
      />
    </GazeContext.Provider>
  );
};

export const useGaze = () => useContext(GazeContext);