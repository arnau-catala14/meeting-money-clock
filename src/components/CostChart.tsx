import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/equivalences';

interface CostDataPoint {
  time: number;
  cost: number;
  label: string;
}

interface CostChartProps {
  data: CostDataPoint[];
  currency: 'USD' | 'EUR';
}

export function CostChart({ data, currency }: CostChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    return data.map(point => ({
      ...point,
      formattedCost: formatCurrency(point.cost, currency),
    }));
  }, [data, currency]);

  if (chartData.length < 2) {
    return (
      <div className="glass-card p-6 h-48 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Chart will appear after a few seconds...
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Cost Accumulation
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              stroke="hsl(215, 20%, 45%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(215, 20%, 45%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => currency === 'USD' ? `$${value}` : `${value}€`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(217, 33%, 17%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(215, 20%, 65%)' }}
              itemStyle={{ color: 'hsl(0, 84%, 60%)' }}
              formatter={(value: number) => [formatCurrency(value, currency), 'Cost']}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              fill="url(#costGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
