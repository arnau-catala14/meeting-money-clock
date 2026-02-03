import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ConfigForm } from '@/components/ConfigForm';
import { ActiveMeeting } from '@/components/ActiveMeeting';
import { MeetingReceipt } from '@/components/MeetingReceipt';
import { useMeetingTimer, type MeetingConfig } from '@/hooks/useMeetingTimer';

type ViewState = 'setup' | 'active' | 'summary';

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>('setup');
  const [config, setConfig] = useState<MeetingConfig>({
    attendees: 5,
    hourlyRate: 60,
    currency: 'USD',
  });

  const {
    timerState,
    meetingData,
    costHistory,
    formatTime,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useMeetingTimer(config);

  const handleStart = useCallback((newConfig: MeetingConfig) => {
    setConfig(newConfig);
    start();
    setViewState('active');
  }, [start]);

  const handleStop = useCallback(() => {
    stop();
    setViewState('summary');
  }, [stop]);

  const handleNewMeeting = useCallback(() => {
    reset();
    setViewState('setup');
  }, [reset]);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <AnimatePresence mode="wait">
          {viewState === 'setup' && (
            <ConfigForm key="setup" onStart={handleStart} />
          )}
          
          {viewState === 'active' && (
            <ActiveMeeting
              key="active"
              config={config}
              data={meetingData}
              timerState={timerState}
              costHistory={costHistory}
              formatTime={formatTime}
              onPause={pause}
              onResume={resume}
              onStop={handleStop}
            />
          )}
          
          {viewState === 'summary' && (
            <MeetingReceipt
              key="summary"
              config={config}
              data={meetingData}
              formatTime={formatTime}
              onNewMeeting={handleNewMeeting}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
