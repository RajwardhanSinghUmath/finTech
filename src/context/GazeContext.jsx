import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const GazeContext = createContext();

export const GazeProvider = ({ children }) => {
  const [gaze, setGaze] = useState({ x: 0, y: 0, timestamp: 0 });
  const [isMouseSim, setIsMouseSim] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);


  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const streamRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastTimestampRef = useRef(-1);
  const prevGazeRef = useRef({ x: 0, y: 0 });


  useEffect(() => {
    if (isMouseSim) {
      const handleMouseMove = (e) => {
        setGaze({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
      };
      window.addEventListener('mousemove', handleMouseMove);


      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        stopEyeTracking();
      };
    }
  }, [isMouseSim]);


  useEffect(() => {
    if (!isMouseSim) {
      startEyeTracking();
    }
    return () => {
      stopEyeTracking();
    };
  }, [isMouseSim]);

  const startEyeTracking = async () => {

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


    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Camera API not available. Ensure you are on HTTPS or localhost.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setWebcamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          requestRef.current = requestAnimationFrame(predictWebcam);
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      if (err.name === 'NotAllowedError') {
        console.warn("Camera permission denied. Falling back to mouse simulation.");
        setIsMouseSim(true);
      }
    }
  };

  const stopEyeTracking = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setWebcamStream(null);
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
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !video.paused &&
      !video.ended &&
      landmarker
    ) {

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        try {
          let startTimeMs = performance.now();


          if (startTimeMs <= lastTimestampRef.current) {
            startTimeMs = lastTimestampRef.current + 0.01;
          }
          lastTimestampRef.current = startTimeMs;

          const results = landmarker.detectForVideo(video, startTimeMs);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];


            const leftIris = landmarks[468];
            const rightIris = landmarks[473];


            const avgIrisX = (leftIris.x + rightIris.x) / 2;
            const avgIrisY = (leftIris.y + rightIris.y) / 2;




            const boxWidth = 0.1;
            const boxHeight = 0.025;




            const yOffset = 0.12;


            const minX = 0.5 - (boxWidth / 2);
            const maxX = 0.5 + (boxWidth / 2);
            const minY = (0.5) - (boxHeight / 2);
            const maxY = (0.5 + yOffset) + (boxHeight / 2);


            let normalizedX = (avgIrisX - minX) / (maxX - minX);
            let normalizedY = (avgIrisY - minY) / (maxY - minY);


            normalizedX = Math.max(0, Math.min(1, normalizedX));
            normalizedY = Math.max(0, Math.min(1, normalizedY));


            const targetX = (1 - normalizedX) * window.innerWidth;
            const targetY = normalizedY * window.innerHeight;


            const SMOOTHING_FACTOR = 0.1;

            const smoothX = prevGazeRef.current.x + (targetX - prevGazeRef.current.x) * SMOOTHING_FACTOR;
            const smoothY = prevGazeRef.current.y + (targetY - prevGazeRef.current.y) * SMOOTHING_FACTOR;

            prevGazeRef.current = { x: smoothX, y: smoothY };


            setGaze({
              x: smoothX,
              y: smoothY,

              distance: Math.sqrt(
                Math.pow((leftIris.x - rightIris.x), 2) +
                Math.pow((leftIris.y - rightIris.y), 2)
              )
            });
          }
        } catch (error) {
          console.error("MediaPipe detection error:", error);

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
    <GazeContext.Provider value={{ gaze, isMouseSim, setIsMouseSim, isModelLoaded, webcamStream, stopEyeTracking }}>
      {children}


      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          transform: "scaleX(-1)"
        }}
      />
    </GazeContext.Provider>
  );
};

export const useGaze = () => useContext(GazeContext);