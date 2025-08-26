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
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Pm25 {
  id: number;
  color_id: number;
  aqi: number;
  value: number;
}

interface Pm10 {
  id: number;
  color_id: number;
  aqi: number;
  value: number;
}

interface Air4 {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  createAt: Date;
  area: string;
  nameTH: string;
  nameEN: string;
  stationType: string;
  pm25_id: Pm25[];
  pm10_id: Pm10[];
}

interface ChartProps {
  data1: Air4[];
}

interface DailyStat {
  date: string;
  min: number;
  max: number;
  avg: number;
}

const Chart: React.FC<ChartProps> = ({ data1 }) => {
  const [chartData, setChartData] = useState<ChartData<"line", number[], string> | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [showMin, setShowMin] = useState(false);
  const [showMax, setShowMax] = useState(false);

  // คำนวณค่าเฉลี่ย Min Max ตามวัน
  useEffect(() => {
    if (!data1 || data1.length === 0) return;

    const grouped: Record<string, number[]> = {};

    data1.forEach((item) => {
      const key = `${item.day}/${item.month}/${item.year}`;
      const pmValue = item.pm25_id.length > 0 ? item.pm25_id[0].value : null;
      if (pmValue === null) return;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(pmValue);
    });

    const stats: DailyStat[] = Object.entries(grouped).map(([date, values]) => ({
      date,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
    }));

    setDailyStats(stats);

    const labels = stats.map((s) => s.date);
    const avgValues = stats.map((s) => s.avg);

    setChartData({
      labels,
      datasets: [
        {
          label: "ค่าเฉลี่ย",
          data: avgValues,
          borderColor: "rgba(0, 170, 255, 1)",
          backgroundColor: "rgba(0, 170, 255, 0.3)",
          tension: 0.4,
        },
      ],
    });
  }, [data1]);

  // Update Chart เมื่อกดปุ่ม
  useEffect(() => {
    if (!dailyStats.length) return;

    const labels = dailyStats.map((s) => s.date);

    const datasets: ChartData<"line", number[], string>["datasets"] = [
      {
        label: "ค่าเฉลี่ย",
        data: dailyStats.map((s) => s.avg),
        borderColor: "rgba(0, 170, 255, 1)",
        backgroundColor: "rgba(0, 170, 255, 0.3)",
        tension: 0.4,
      },
    ];

    if (showMin) {
      datasets.push({
        label: "ค่าต่ำสุด",
        data: dailyStats.map((s) => s.min),
        borderColor: "rgba(0, 200, 100, 1)",
        backgroundColor: "rgba(0, 200, 100, 0.3)",
        borderDash: [5, 5],
        tension: 0.4,
      });
    }

    if (showMax) {
      datasets.push({
        label: "ค่าสูงสุด",
        data: dailyStats.map((s) => s.max),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        borderDash: [5, 5],
        tension: 0.4,
      });
    }

    setChartData({ labels, datasets });
  }, [showMin, showMax, dailyStats]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: { legend: { display: true } },
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bangna PM2.5</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowMin((prev) => !prev)}
          className={`px-4 py-2 rounded ${showMin ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          {showMin ? "ซ่อน Min" : "แสดง Min"}
        </button>
        <button
          onClick={() => setShowMax((prev) => !prev)}
          className={`px-4 py-2 rounded ${showMax ? "bg-red-500 text-white" : "bg-gray-200"}`}
        >
          {showMax ? "ซ่อน Max" : "แสดง Max"}
        </button>
      </div>

      {chartData ? <Line data={chartData} options={options} /> : <p>Loading...</p>}
    </div>
  );
};

export default Chart;
