'use client'

import React, { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Pollutant {
  id: number;
  color_id: number;
  aqi: number;
  value: number;
}

interface LastAQI_Ar4thai {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  pm25_id: Pollutant[];
  pm10_id: Pollutant[];
  o3_id: Pollutant[];
  co_id: Pollutant[];
  no2_id: Pollutant[];
  so2_id: Pollutant[];
}

interface ChartProps {
  filteredData: LastAQI_Ar4thai[];
  viewMode: "day" | "week" | "month";
}

const Chart: React.FC<ChartProps> = ({ filteredData, viewMode }) => {
  const [visibleLines, setVisibleLines] = useState({
    pm25: true,
    pm10: true,
    o3: false,
    co: false,
    no2: false,
    so2: false,
  });

  // ✅ คำนวณค่าเฉลี่ยรายวัน (ใช้ตอนเลือก week/month)
  const calculateDailyAverage = () => {
    const grouped: {
      [key: string]: {
        pm25: number;
        pm10: number;
        o3: number;
        co: number;
        no2: number;
        so2: number;
        count: number;
      };
    } = {};

    filteredData.forEach((d) => {
      const key = `${d.day}/${d.month}`;
      if (!grouped[key]) {
        grouped[key] = { pm25: 0, pm10: 0, o3: 0, co: 0, no2: 0, so2: 0, count: 0 };
      }

      grouped[key].pm25 += d.pm25_id[0]?.value ?? 0;
      grouped[key].pm10 += d.pm10_id[0]?.value ?? 0;
      grouped[key].o3 += d.o3_id[0]?.value ?? 0;
      grouped[key].co += d.co_id[0]?.value ?? 0;
      grouped[key].no2 += d.no2_id[0]?.value ?? 0;
      grouped[key].so2 += d.so2_id[0]?.value ?? 0;
      grouped[key].count += 1;
    });

    return Object.entries(grouped).map(([key, val]) => ({
      name: key,
      pm25: val.pm25 / val.count,
      pm10: val.pm10 / val.count,
      o3: val.o3 / val.count,
      co: val.co / val.count,
      no2: val.no2 / val.count,
      so2: val.so2 / val.count,
    }));
  };

  // ✅ เลือกข้อมูลสำหรับกราฟ
  const chartData =
    viewMode === "day"
      ? filteredData.map((d) => ({
          name: `${d.hours}:00`,
          pm25: d.pm25_id[0]?.value ?? null,
          pm10: d.pm10_id[0]?.value ?? null,
          o3: d.o3_id[0]?.value ?? null,
          co: d.co_id[0]?.value ?? null,
          no2: d.no2_id[0]?.value ?? null,
          so2: d.so2_id[0]?.value ?? null,
        }))
      : calculateDailyAverage();

  const lineColors: Record<string, string> = {
    pm25: "#8884d8",
    pm10: "#82ca9d",
    o3: "#ff7300",
    co: "#ff0000",
    no2: "#0088FE",
    so2: "#AA336A",
  };

  return (
    <div>
      {/* ปุ่มเลือกแสดงเส้น */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.keys(visibleLines).map((key) => (
          <button
            key={key}
            onClick={() =>
              setVisibleLines({
                ...visibleLines,
                [key]: !visibleLines[key as keyof typeof visibleLines],
              })
            }
            className={`px-3 py-1 rounded text-sm ${
              visibleLines[key as keyof typeof visibleLines]
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      {/* กราฟ */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          {/* ✅ ให้แกน Y ปรับ min/max อัตโนมัติจากข้อมูล */}
          <YAxis domain={["dataMin", "dataMax"]} allowDecimals={true} />
          <Tooltip />
          <Legend />
          {Object.entries(visibleLines).map(
            ([key, show]) =>
              show && (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={lineColors[key]}
                  name={key.toUpperCase()}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
              )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
