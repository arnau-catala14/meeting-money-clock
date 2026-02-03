import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

interface MoneyTickerProps {
  value: number;
  currency: 'USD' | 'EUR';
}

export function MoneyTicker({ value, currency }: MoneyTickerProps) {
  const symbol = currency === 'USD' ? '$' : '€';
  const [displayValue, setDisplayValue] = useState(value);
  
  // Smooth value updates
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formattedParts = useMemo(() => {
    const formatted = displayValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatted.split('');
  }, [displayValue]);

  return (
    <div className="money-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-primary">
      {currency === 'USD' && (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block mr-2"
        >
          {symbol}
        </motion.span>
      )}
      <AnimatePresence mode="popLayout">
        {formattedParts.map((char, index) => (
          <motion.span
            key={`${index}-${char}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.15,
              ease: 'easeOut',
            }}
            className="inline-block"
            style={{
              width: char === ',' || char === '.' ? 'auto' : '0.6em',
              textAlign: 'center',
            }}
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
      {currency === 'EUR' && (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block ml-2"
        >
          {symbol}
        </motion.span>
      )}
    </div>
  );
}
