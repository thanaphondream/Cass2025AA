'use client'

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { hours3weather } from './page'

interface WeatherChartProps {
  filteredData: hours3weather[]
  selectedVariable: keyof hours3weather
  variableLabel: string
  variableColor: string
}

const WeatherChart: React.FC<WeatherChartProps> = ({
  filteredData,
  selectedVariable,
  variableLabel,
  variableColor
}) => {

  const chartData = filteredData.map(d => ({
    time: `${d.day.toString().padStart(2, '0')}/${d.month.toString().padStart(2, '0')} ${d.hours.toString().padStart(2, '0')}:00`,
    value: d[selectedVariable] as number
  }))

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name={variableLabel}
            stroke={variableColor}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeatherChart
