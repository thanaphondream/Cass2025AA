'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { hours3weather } from './page'

interface WeatherChartProps {
  filteredData: hours3weather[]
  selectedVariable: keyof hours3weather
  variableLabel: string
  variableColor: string
  viewMode: 'day' | 'week' | 'month'
}

const WeatherChart: React.FC<WeatherChartProps> = ({
  filteredData,
  selectedVariable,
  variableLabel,
  variableColor,
  viewMode
}) => {

  // ✅ ถ้าเป็นรายเดือนหรือรายสัปดาห์ → ทำค่าเฉลี่ยรายวัน
  const chartData = useMemo(() => {
    if (viewMode === 'day') {
      // ❌ ไม่ทำค่าเฉลี่ย ใช้ข้อมูลดิบตามชั่วโมง
      return filteredData.map(d => ({
        time: `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')} ${String(d.hours).padStart(2, '0')}:00`,
        value: Number(d[selectedVariable])
      }))
    }

    // ✅ กรณีรายสัปดาห์หรือรายเดือน → ทำค่าเฉลี่ยรายวัน
    const grouped: Record<string, number[]> = {}

    filteredData.forEach(d => {
      const dateKey = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
      const value = Number(d[selectedVariable])

      if (!isNaN(value)) {
        if (!grouped[dateKey]) grouped[dateKey] = []
        grouped[dateKey].push(value)
      }
    })

    return Object.entries(grouped).map(([date, values]) => ({
      time: date,
       value: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3))
    }))
  }, [filteredData, selectedVariable, viewMode])

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border">
      <h2 className="text-lg font-semibold mb-2">
        {viewMode === 'day'
          ? `กราฟรายชั่วโมง (${variableLabel})`
          : `กราฟค่าเฉลี่ยรายวัน (${variableLabel})`}
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [value, variableLabel]} labelStyle={{ fontWeight: 'bold' }} />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={variableColor}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={variableLabel}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeatherChart
