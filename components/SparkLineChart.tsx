import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ExerciseDataPoint } from '../types.ts';

interface SparkLineChartProps {
  data: ExerciseDataPoint[];
  evolution: number;
}

const SparkLineChart: React.FC<SparkLineChartProps> = ({ data, evolution }) => {

  if (data.length < 1) { // Guard for empty data
    return null;
  }

  const formattedData = data.map(point => ({
      maxWeight: point.maxWeight
  }));

  const initialWeight = data[0].maxWeight;
  const currentWeight = data[data.length - 1].maxWeight;

  const strokeColor = evolution > 0 
      ? '#22c55e' // green-500
      : evolution < 0 
      ? '#ef4444' // red-500
      : '#6b7280'; // gray-500

  const textColor = evolution > 0 
      ? 'text-green-500 dark:text-green-400' 
      : evolution < 0 
      ? 'text-red-500 dark:text-red-400' 
      : 'text-gray-600 dark:text-gray-400';

  return (
    <div className="flex items-center justify-center gap-x-2">
        {/* Initial Weight */}
        <span className="text-base font-semibold text-gray-400 text-right w-12 shrink-0">
            {initialWeight}<span className="text-xs opacity-80">kg</span>
        </span>

        {/* Chart */}
        <div style={{ width: '50px', height: '30px' }} className="shrink-0">
            <ResponsiveContainer>
                <LineChart data={formattedData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <Line 
                    type="monotone" 
                    dataKey="maxWeight" 
                    stroke={strokeColor} 
                    strokeWidth={2.5}
                    dot={false} 
                />
                </LineChart>
            </ResponsiveContainer>
        </div>

        {/* Current Weight */}
        <span className={`text-base font-bold ${textColor} w-12 shrink-0`}>
             {currentWeight}<span className="text-xs opacity-80">kg</span>
        </span>
    </div>
  );
};

export default SparkLineChart;