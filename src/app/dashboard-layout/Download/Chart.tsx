"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ---------------- Types ----------------
interface MeteorologicalRecord {
  day: number;
  month: number;
  year: number;
  temperaturde: number; // หรือเปลี่ยนเป็น temperature ถ้าต้องการ
  humidity: number;
  rain: number;
}

interface LocationData {
  meteorological_id: MeteorologicalRecord[];
}

interface DailyStats {
  date: string;
  temperature: { avg: number; min: number; max: number };
  humidity: { avg: number; min: number; max: number };
  rain: { avg: number; min: number; max: number };
}

interface ClimateChartProps {
  meteorologicalData: LocationData[];
}

// ---------------- Helper ----------------
const average = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

// ---------------- Component ----------------
const Chart: React.FC<ClimateChartProps> = ({ meteorologicalData }) => {
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: any[] } | null>(null);
  const [metricsData, setMetricsData] = useState<DailyStats[] | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<"temperature" | "humidity" | "rain">("temperature");
  const [showMinMax, setShowMinMax] = useState(false);

  // ---------------- Process Data ----------------
  useEffect(() => {
    const allRecords: MeteorologicalRecord[] = meteorologicalData.flatMap(
      (loc) => loc.meteorological_id
    );

    const grouped: Record<string, MeteorologicalRecord[]> = {};
    allRecords.forEach((item) => {
      const key = `${item.day}/${item.month}/${item.year}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const dailyStats: DailyStats[] = Object.entries(grouped).map(([date, items]) => {
      const temps = items.map(i => i.temperaturde);
      const hums = items.map(i => i.humidity);
      const rains = items.map(i => i.rain);

      return {
        date,
        temperature: { avg: average(temps), min: Math.min(...temps), max: Math.max(...temps) },
        humidity: { avg: average(hums), min: Math.min(...hums), max: Math.max(hums) },
        rain: { avg: average(rains), min: Math.min(...rains), max: Math.max(...rains) },
      };
    });

    setMetricsData(dailyStats);
  }, [meteorologicalData]);

  // ---------------- Update Chart ----------------
  useEffect(() => {
    if (!metricsData) return;

    const labels = metricsData.map(d => d.date);
    const avgData = metricsData.map(d => d[selectedMetric].avg);
    const minData = metricsData.map(d => d[selectedMetric].min);
    const maxData = metricsData.map(d => d[selectedMetric].max);

    const datasets = [
      {
        label: `${selectedMetric.toUpperCase()} (avg)`,
        data: avgData,
        borderColor: "rgba(0, 150, 255, 1)",
        backgroundColor: "rgba(0,150,255,0.3)",
        tension: 0.3,
        pointRadius: 3,
      },
    ];

    if (showMinMax) {
      datasets.push(
        {
          label: `${selectedMetric.toUpperCase()} (min)`,
          data: minData,
          borderColor: "green",
          backgroundColor: "rgba(0,255,0,0.3)",
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: `${selectedMetric.toUpperCase()} (max)`,
          data: maxData,
          borderColor: "red",
          backgroundColor: "rgba(255,0,0,0.3)",
          tension: 0.3,
          pointRadius: 3,
        }
      );
    }

    setChartData({ labels, datasets });
  }, [selectedMetric, metricsData, showMinMax]);

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: false } },
  };

  // ---------------- Render ----------------
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Climate Data</h2>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setSelectedMetric("temperature")} className="px-3 py-1 bg-blue-500 text-white rounded">
          อุณหภูมิ
        </button>
        <button onClick={() => setSelectedMetric("humidity")} className="px-3 py-1 bg-green-500 text-white rounded">
          ความชื้น
        </button>
        <button onClick={() => setSelectedMetric("rain")} className="px-3 py-1 bg-purple-500 text-white rounded">
          ปริมาณฝน
        </button>
        <button onClick={() => setShowMinMax(!showMinMax)} className="px-3 py-1 bg-gray-500 text-white rounded">
          {showMinMax ? "ซ่อน Min/Max" : "แสดง Min/Max"}
        </button>
      </div>

      {chartData ? <Line data={chartData} options={options} /> : <p>Loading...</p>}
    </div>
  );
};

export default Chart;
