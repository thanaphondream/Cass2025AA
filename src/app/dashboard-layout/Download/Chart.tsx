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

interface MeteorologicalData {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  temperaturde: number;
  humidity: number;
  slp: number;
  rain: number;
  windspeed10m: number;
  winddirdedtion10m: number;
  lowcloud: number;
  highcloud: number;
  date: string;
}

interface LocationData {
  id: number;
  name_location: string;
  latitude: number;
  longitude: number;
  date: string;
  meteorological_id: MeteorologicalData[];
}

type Metric = "temperature" | "humidity" | "rain";

interface DailyStats {
  date: string;
  temperature: { avg: number; min: number; max: number };
  humidity: { avg: number; min: number; max: number };
  rain: { avg: number; min: number; max: number };
}

interface ClimateChartProps {
  meteorologicalData: LocationData[];
}

interface ChartDataSet {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

const Chart: React.FC<ClimateChartProps> = ({ meteorologicalData }) => {
  const [chartData, setChartData] = useState<ChartDataSet | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<Metric>("temperature");
  const [metricsData, setMetricsData] = useState<DailyStats[] | null>(null);
  const [showMinMax, setShowMinMax] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      const allRecords = meteorologicalData.flatMap(loc => loc.meteorological_id);

      const grouped: Record<string, MeteorologicalData[]> = {};
      allRecords.forEach(item => {
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
          humidity: { avg: average(hums), min: Math.min(...hums), max: Math.max(...hums) },
          rain: { avg: average(rains), min: Math.min(...rains), max: Math.max(...rains) },
        };
      });

      setMetricsData(dailyStats);
    };

    fetchData();
  }, [meteorologicalData]);

  const average = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

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
        },
        {
          label: `${selectedMetric.toUpperCase()} (max)`,
          data: maxData,
          borderColor: "red",
          backgroundColor: "rgba(255,0,0,0.3)",
          tension: 0.3,
        }
      );
    }

    setChartData({ labels, datasets });
  }, [selectedMetric, metricsData, showMinMax]);

  const options = { responsive: true, plugins: { legend: { display: true } } };

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
        <button
          onClick={() => setShowMinMax(!showMinMax)}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          {showMinMax ? "ซ่อน Min/Max" : "แสดง Min/Max"}
        </button>
      </div>

      {chartData ? <Line data={chartData} options={options} /> : <p>Loading...</p>}
    </div>
  );
};

export default Chart;
