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
  
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const costPerSecond = (config.attendees * config.hourlyRate) / 3600;

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const tick = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp - pausedTimeRef.current;
    }

    const elapsed = timestamp - startTimeRef.current;
    const elapsedSeconds = Math.floor(elapsed / 1000);
    const totalCost = costPerSecond * (elapsed / 1000);

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

    setMeetingData({
      elapsedSeconds,
      totalCost,
      costPerSecond,
      startTime: meetingData.startTime,
      endTime: null,
    });

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [costPerSecond, formatTime, meetingData.startTime]);

  const start = useCallback(() => {
    const now = new Date();
    setMeetingData(prev => ({
      ...prev,
      startTime: now,
      endTime: null,
    }));
    setCostHistory([{ time: 0, cost: 0, label: '00:00:00' }]);
    setTimerState({ isRunning: true, isPaused: false });
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    lastUpdateRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      pausedTimeRef.current = performance.now() - (startTimeRef.current || 0);
    }
    setTimerState({ isRunning: true, isPaused: true });
  }, []);

  const resume = useCallback(() => {
    setTimerState({ isRunning: true, isPaused: false });
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setMeetingData(prev => ({
      ...prev,
      endTime: new Date(),
    }));
    setTimerState({ isRunning: false, isPaused: false });
  }, []);

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
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
    pausedTimeRef.current = 0;
    lastUpdateRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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
