import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { ExerciseDataPoint } from '../types.ts';

interface LineProgressChartProps {
  data: ExerciseDataPoint[];
}

const LineProgressChart: React.FC<LineProgressChartProps> = ({ data }) => {
  const axisColor = '#9ca3af';
  const gridColor = '#374151';
  
  const formattedData = data.map(point => ({
      name: new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      'Carga Máxima': point.maxWeight
  }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <LineChart
          data={formattedData}
          margin={{
            top: 20,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
          <YAxis 
            tick={{ fill: axisColor, fontSize: 12 }} 
            unit="kg" 
            domain={['dataMin - 5', 'dataMax + 5']} 
            allowDecimals={false}
           />
          <Tooltip 
            cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }}
            contentStyle={{
                backgroundColor: '#1f2937',
                border: `1px solid ${gridColor}`,
                borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={(value) => [`${value} kg`, 'Carga Máxima']}
            labelFormatter={(label) => new Date(data.find(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) === label)?.date || '').toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'})}
          />
          <Legend formatter={(value) => <span style={{color: axisColor}}>{value}</span>} />
          <Line type="monotone" dataKey="Carga Máxima" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}>
            <LabelList dataKey="Carga Máxima" position="top" style={{ fill: axisColor, fontSize: 12 }} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineProgressChart;