import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square, Clock } from 'lucide-react';
import { MoneyTicker } from './MoneyTicker';
import { EquivalenceDisplay } from './EquivalenceDisplay';
import { CostChart } from './CostChart';
import { formatCurrency } from '@/lib/equivalences';
import type { MeetingConfig, MeetingData, TimerState } from '@/hooks/useMeetingTimer';
interface CostDataPoint {
  time: number;
  cost: number;
  label: string;
}

interface ActiveMeetingProps {
  config: MeetingConfig;
  data: MeetingData;
  timerState: TimerState;
  costHistory: CostDataPoint[];
  formatTime: (seconds: number) => string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function ActiveMeeting({
  config,
  data,
  timerState,
  costHistory,
  formatTime,
  onPause,
  onResume,
  onStop,
}: ActiveMeetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <div className={`pulse-dot ${timerState.isPaused ? 'opacity-50' : ''}`} />
        <span className="text-lg font-medium text-foreground">
          {timerState.isPaused ? 'Meeting Paused' : 'Meeting in Progress'}
        </span>
      </div>

      {/* Hero: Money Counter */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 sm:p-10 text-center"
      >
        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-4">
          Total Cost
        </p>
        <MoneyTicker value={data.totalCost} currency={config.currency} />
        
        {/* Timer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-2xl sm:text-3xl">
            {formatTime(data.elapsedSeconds)}
          </span>
        </div>

        {/* Burn Rate */}
        <div className="mt-4 text-sm text-muted-foreground">
          Burning at{' '}
          <span className="text-primary font-semibold">
            {formatCurrency((config.attendees * config.hourlyRate) / 60, config.currency)}/min
          </span>
        </div>
      </motion.div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equivalence Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EquivalenceDisplay cost={data.totalCost} currency={config.currency} />
        </motion.div>

        {/* Cost Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CostChart data={costHistory} currency={config.currency} />
        </motion.div>
      </div>

      {/* Meeting Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Attendees
            </div>
            <div className="text-xl font-bold font-mono">{config.attendees}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Rate/Person
            </div>
            <div className="text-xl font-bold font-mono">
              {formatCurrency(config.hourlyRate, config.currency)}/h
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Cost/Person
            </div>
            <div className="text-xl font-bold font-mono text-primary">
              {formatCurrency(data.totalCost / config.attendees, config.currency)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center gap-4"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={timerState.isPaused ? onResume : onPause}
          className="h-14 px-8 border-warning text-warning hover:bg-warning/10"
        >
          {timerState.isPaused ? (
            <>
              <Play className="w-5 h-5 mr-2" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          )}
        </Button>
        <Button
          size="lg"
          onClick={onStop}
          className="h-14 px-8 bg-primary hover:bg-primary/90"
        >
          <Square className="w-5 h-5 mr-2" />
          End Meeting
        </Button>
      </motion.div>
    </motion.div>
  );
}
