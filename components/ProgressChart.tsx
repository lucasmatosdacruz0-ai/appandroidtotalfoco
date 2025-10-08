import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  data: { name: string; [key: string]: number | string }[];
  dataKey: string;
  unit?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, dataKey, unit = '' }) => {
  const axisColor = '#9ca3af';
  const gridColor = '#374151';

  if (data.length === 0) {
      return (
          <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-gray-400">
              <p>Nenhum dado de volume para exibir ainda. Complete um treino!</p>
          </div>
      );
  }
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
          <YAxis tick={{ fill: axisColor, fontSize: 12 }} unit={unit} />
          <Tooltip 
            cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }}
            contentStyle={{
                backgroundColor: '#1f2937',
                border: `1px solid ${gridColor}`,
                borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#f9fafb' }}
          />
          <Legend formatter={(value) => <span style={{color: axisColor}}>{value}</span>} />
          <Bar dataKey={dataKey} fill="#3B82F6" name={dataKey} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;