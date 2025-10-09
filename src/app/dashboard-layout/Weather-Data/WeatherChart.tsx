'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { hours3weather } from './page';

interface WeatherChartProps {
  filteredData: hours3weather[];
  viewMode: 'day' | 'week' | 'month';
  selectedVariable: 'temperaturde' | 'humidity' | 'rain' | 'windspeed10m' | 'slp';
  getVariableDetails: (
    variable: 'temperaturde' | 'humidity' | 'rain' | 'windspeed10m' | 'slp'
  ) => {
    label: string;
    icon: React.ElementType;
    color: string;
  };
}

// ✅ ประกาศ type สำหรับ Tooltip อย่างถูกต้อง
interface CustomTooltipProps extends TooltipProps<number, string> {
  getVariableDetails: (
    variable: 'temperaturde' | 'humidity' | 'rain' | 'windspeed10m' | 'slp'
  ) => {
    label: string;
    icon: React.ElementType;
    color: string;
  };
  selectedVariable: 'temperaturde' | 'humidity' | 'rain' | 'windspeed10m' | 'slp';
}

const formatXAxis = (timestamp: number, viewMode: WeatherChartProps['viewMode']) => {
  const date = new Date(timestamp);
  if (viewMode === 'day') {
    return `${date.getHours().toString().padStart(2, '0')}:00`;
  }
  return `${date.getMonth() + 1}/${date.getDate()} ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:00`;
};

// ✅ Tooltip พร้อม type ถูกต้อง
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  getVariableDetails,
  selectedVariable,
}) => {
  if (active && payload && payload.length) {
    const details = getVariableDetails(selectedVariable);
    const date = new Date(label as number);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;

    return (
      <div className="p-3 bg-white border border-gray-300 shadow-lg rounded-lg text-sm">
        <p className="font-bold text-gray-700 mb-1">{dateStr}</p>
        <p className="text-sm" style={{ color: details.color }}>
          {details.label}:{' '}
          <span className="font-semibold">
            {Number(payload[0].value).toFixed(
              selectedVariable === 'rain' ||
                selectedVariable === 'temperaturde' ||
                selectedVariable === 'humidity' ||
                selectedVariable === 'windspeed10m'
                ? 1
                : 2
            )}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const WeatherChart: React.FC<WeatherChartProps> = ({
  filteredData,
  viewMode,
  selectedVariable,
  getVariableDetails,
}) => {
  const details = getVariableDetails(selectedVariable);

  const chartData = filteredData.map((d) => ({
    time: d.date.getTime(),
    [selectedVariable]: d[selectedVariable],
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => formatXAxis(value, viewMode)}
            label={{
              value: viewMode === 'day' ? 'เวลา' : 'วัน-เวลา',
              position: 'bottom',
              offset: 0,
              fill: '#4b5563',
            }}
            minTickGap={20}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            label={{
              value: details.label,
              angle: -90,
              position: 'left',
              fill: '#4b5563',
            }}
          />
          <Tooltip
            content={
              <CustomTooltip
                getVariableDetails={getVariableDetails}
                selectedVariable={selectedVariable}
              />
            }
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey={selectedVariable}
            name={details.label.split('(')[0].trim()}
            stroke={details.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherChart;
