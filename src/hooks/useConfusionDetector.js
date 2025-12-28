import { useState, useEffect, useRef } from 'react';
import { useGaze } from '../context/GazeContext.jsx';

const DWELL_THRESHOLD_MS = 5000;
const SACCADE_VELOCITY_THRESHOLD = 3;
const REVIST_LIMIT = 3;
const SACCADE_MIN_COUNT = 3;

export const useConfusionDetector = (zones) => {
  const { gaze } = useGaze();
  const [confusionState, setConfusionState] = useState({ isConfused: false, reason: '', zoneId: null });

  const gazeHistory = useRef([]);
  const zoneStats = useRef({});
  const mountTime = useRef(Date.now());


  useEffect(() => {
    if (!gaze.x || !gaze.y) return;

    const now = Date.now();
    const currentPoint = { ...gaze, time: now };

    gazeHistory.current.push(currentPoint);
    if (gazeHistory.current.length > 10) gazeHistory.current.shift();

    const recentSaccades = (now - mountTime.current < 2000) ? 0 : gazeHistory.current.reduce((count, point, index, arr) => {
      if (index === 0) return count;
      const prev = arr[index - 1];
      const dist = Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
      const duration = point.time - prev.time;
      const velocity = duration > 0 ? dist / duration : 0;
      return velocity > SACCADE_VELOCITY_THRESHOLD ? count + 1 : count;
    }, 0);

    const activeZone = zones.find(z =>
      gaze.x >= z.left && gaze.x <= z.right && gaze.y >= z.top && gaze.y <= z.bottom
    );

    if (activeZone) {
      const zId = activeZone.id;

      if (!zoneStats.current[zId]) {
        zoneStats.current[zId] = { dwell: 0, revisits: 0, lastTime: now };
      }

      const stats = zoneStats.current[zId];

      stats.dwell += (now - stats.lastTime);
      stats.lastTime = now;

      const prevPoint = gazeHistory.current[gazeHistory.current.length - 2];
      const wasInDifferentZone = prevPoint && !isGazeInSpecificZone(prevPoint.x, prevPoint.y, activeZone);

      if (wasInDifferentZone) {
        stats.revisits += 1;
      }

      if (stats.dwell > DWELL_THRESHOLD_MS) {
        setConfusionState({ isConfused: true, reason: 'High Dwell Time', zoneId: zId });
      } else if (stats.revisits > REVIST_LIMIT) {
        setConfusionState({ isConfused: true, reason: 'Frequent Re-reading', zoneId: zId });
      } else if (recentSaccades >= SACCADE_MIN_COUNT) {
        setConfusionState({ isConfused: true, reason: 'Rapid Scanning', zoneId: zId });
      }
    } else {
      Object.keys(zoneStats.current).forEach(id => {
        zoneStats.current[id].lastTime = now;
      });
    }

  }, [gaze, zones]);

  return confusionState;
};

const isGazeInSpecificZone = (x, y, zone) => {
  return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
};