import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { getEquivalence, getNextEquivalence, formatCurrency } from '@/lib/equivalences';
import { Progress } from '@/components/ui/progress';

interface EquivalenceDisplayProps {
  cost: number;
  currency: 'USD' | 'EUR';
}

export function EquivalenceDisplay({ cost, currency }: EquivalenceDisplayProps) {
  const [lastEquivalence, setLastEquivalence] = useState<string | null>(null);

  const currentEquivalence = useMemo(() => getEquivalence(cost), [cost]);
  const nextEquivalence = useMemo(() => getNextEquivalence(cost), [cost]);

  const progressToNext = useMemo(() => {
    if (!nextEquivalence) return 100;
    const prevThreshold = currentEquivalence?.threshold || 0;
    const range = nextEquivalence.threshold - prevThreshold;
    const progress = ((cost - prevThreshold) / range) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [cost, currentEquivalence, nextEquivalence]);

  useEffect(() => {
    if (currentEquivalence && currentEquivalence.item !== lastEquivalence) {
      setLastEquivalence(currentEquivalence.item);
    }
  }, [currentEquivalence, lastEquivalence]);

  return (
    <div className="space-y-6">
      {/* Current equivalence */}
      <AnimatePresence mode="wait">
        {currentEquivalence && (
          <motion.div
            key={currentEquivalence.item}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass-card p-6 text-center"
          >
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
              You have just burned
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{currentEquivalence.emoji}</span>
              <span className="text-2xl font-semibold text-foreground">
                {currentEquivalence.item}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress to next equivalence */}
      {nextEquivalence && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Next milestone:</span>
            <span className="text-foreground font-medium">
              {nextEquivalence.emoji} {nextEquivalence.item}
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatCurrency(cost, currency)}</span>
            <span>{formatCurrency(nextEquivalence.threshold, currency)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
