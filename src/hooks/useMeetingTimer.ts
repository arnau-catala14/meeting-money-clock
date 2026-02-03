import { useState, useRef, useCallback, useEffect } from 'react';

export interface MeetingConfig {
  attendees: number;
  hourlyRate: number;
  currency: 'USD' | 'EUR';
}

export interface MeetingData {
  elapsedSeconds: number;
  totalCost: number;
  costPerSecond: number;
  startTime: Date | null;
  endTime: Date | null;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
}

interface CostDataPoint {
  time: number;
  cost: number;
  label: string;
}

export function useMeetingTimer(config: MeetingConfig) {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
  });
  
  const [meetingData, setMeetingData] = useState<MeetingData>({
    elapsedSeconds: 0,
    totalCost: 0,
    costPerSecond: 0,
    startTime: null,
    endTime: null,
  });

  const [costHistory, setCostHistory] = useState<CostDataPoint[]>([]);
  
  // Refs for precise time tracking logic
  const startTimeRef = useRef<number | null>(null);     // When the current active segment started (Date.now())
  const accumulatedTimeRef = useRef<number>(0);         // Total time accumulated from previous segments (ms)
  const lastUpdateRef = useRef<number>(0);              // Last second we updated history for
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const costPerSecond = (config.attendees * config.hourlyRate) / 3600;

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Main timer loop
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      // If we don't have a start time for this segment, set it now
      // This handles the very first start or a resume
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      timerIntervalRef.current = setInterval(() => {
        if (!startTimeRef.current) return;

        const now = Date.now();
        const currentSegmentDuration = now - startTimeRef.current;
        const totalElapsedMs = accumulatedTimeRef.current + currentSegmentDuration;
        const elapsedSeconds = Math.floor(totalElapsedMs / 1000);
        const totalCost = costPerSecond * (totalElapsedMs / 1000);

        setMeetingData(prev => ({
          ...prev,
          elapsedSeconds,
          totalCost,
          costPerSecond,
        }));

        // Update cost history every 5 seconds
        if (elapsedSeconds > 0 && elapsedSeconds % 5 === 0 && elapsedSeconds !== lastUpdateRef.current) {
          lastUpdateRef.current = elapsedSeconds;
          setCostHistory(prev => [
            ...prev,
            {
              time: elapsedSeconds,
              cost: totalCost,
              label: formatTime(elapsedSeconds),
            },
          ]);
        }
      }, 100); // 100ms update rate for smoothness
    } else {
      // Clean up interval if not running or paused
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, costPerSecond, formatTime]);

  const start = useCallback(() => {
    const now = new Date();
    setMeetingData({
      elapsedSeconds: 0,
      totalCost: 0,
      costPerSecond,
      startTime: now,
      endTime: null,
    });
    setCostHistory([{ time: 0, cost: 0, label: '00:00:00' }]);
    
    // Reset refs
    accumulatedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    lastUpdateRef.current = 0;

    setTimerState({ isRunning: true, isPaused: false });
  }, [costPerSecond]);

  const pause = useCallback(() => {
    // Calculate and save the time from the current segment
    if (startTimeRef.current) {
      const now = Date.now();
      accumulatedTimeRef.current += (now - startTimeRef.current);
      startTimeRef.current = null;
    }
    setTimerState({ isRunning: true, isPaused: true });
  }, []);

  const resume = useCallback(() => {
    // Start a new segment
    startTimeRef.current = Date.now();
    setTimerState({ isRunning: true, isPaused: false });
  }, []);

  const stop = useCallback(() => {
    setMeetingData(prev => ({
      ...prev,
      endTime: new Date(),
    }));
    setTimerState({ isRunning: false, isPaused: false });
    startTimeRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setMeetingData({
      elapsedSeconds: 0,
      totalCost: 0,
      costPerSecond: 0,
      startTime: null,
      endTime: null,
    });
    setCostHistory([]);
    setTimerState({ isRunning: false, isPaused: false });
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    lastUpdateRef.current = 0;
  }, []);

  return {
    timerState,
    meetingData,
    costHistory,
    formatTime,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}