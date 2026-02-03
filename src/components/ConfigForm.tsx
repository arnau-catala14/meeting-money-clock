import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, DollarSign, Flame, Euro } from 'lucide-react';
import { formatCurrency } from '@/lib/equivalences';
import type { MeetingConfig } from '@/hooks/useMeetingTimer';

interface ConfigFormProps {
  onStart: (config: MeetingConfig) => void;
}

const ratePresets = [
  { label: 'Intern', rate: 15, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { label: 'Dev', rate: 60, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Manager', rate: 100, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'Exec', rate: 250, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];

export function ConfigForm({ onStart }: ConfigFormProps) {
  const [attendees, setAttendees] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(60);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

  const isValid = attendees > 0 && hourlyRate > 0;
  const estimatedCostPerHour = attendees * hourlyRate;

  const handleStart = () => {
    if (isValid) {
      onStart({ attendees, hourlyRate, currency });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
        >
          <Flame className="w-5 h-5 text-primary" />
          <span className="text-primary font-semibold">MeetingBurner</span>
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Calculate the True Cost
        </h1>
        <p className="text-muted-foreground">
          Set up your meeting parameters to start tracking expenses
        </p>
      </div>

      {/* Config Card */}
      <div className="glass-card p-6 sm:p-8 space-y-8">
        {/* Attendees */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-muted-foreground" />
              Number of Attendees
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={100}
                value={attendees}
                onChange={(e) => setAttendees(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center font-mono bg-muted/50"
              />
            </div>
          </div>
          <Slider
            value={[attendees]}
            onValueChange={([value]) => setAttendees(value)}
            min={1}
            max={20}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 person</span>
            <span>20 people</span>
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-foreground">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Average Hourly Rate
            </Label>
            <div className="relative">
              {currency === 'USD' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
              )}
              <Input
                type="number"
                min={1}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-24 font-mono bg-muted/50 ${currency === 'USD' ? 'pl-7 text-right' : 'pr-7 text-left'}`}
              />
              {currency === 'EUR' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
              )}
            </div>
          </div>

          {/* Rate Presets */}
          <div className="flex flex-wrap gap-2">
            {ratePresets.map((preset) => (
              <Badge
                key={preset.label}
                variant="outline"
                className={`cursor-pointer transition-all hover:scale-105 ${
                  hourlyRate === preset.rate
                    ? preset.color + ' ring-1 ring-offset-1 ring-offset-background'
                    : 'hover:bg-muted'
                } ${preset.color}`}
                onClick={() => setHourlyRate(preset.rate)}
              >
                {preset.label} ({currency === 'USD' ? `$${preset.rate}` : `${preset.rate}€`}/h)
              </Badge>
            ))}
          </div>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <Label className="flex items-center gap-2 text-foreground">
            Currency
          </Label>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${currency === 'USD' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <DollarSign className="w-4 h-4 inline" /> USD
            </span>
            <Switch
              checked={currency === 'EUR'}
              onCheckedChange={(checked) => setCurrency(checked ? 'EUR' : 'USD')}
            />
            <span className={`text-sm font-medium transition-colors ${currency === 'EUR' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <Euro className="w-4 h-4 inline" /> EUR
            </span>
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated burn rate:</span>
            <span className="font-mono text-lg text-primary font-semibold">
              {formatCurrency(estimatedCostPerHour, currency)}/hour
            </span>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={!isValid}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow disabled:animate-none disabled:opacity-50"
        >
          <Flame className="w-5 h-5 mr-2" />
          START BURNING CASH
        </Button>
      </div>
    </motion.div>
  );
}
