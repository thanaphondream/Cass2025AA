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

type ClimateChartProps = {
  meteorologicalData: any; // หรือกำหนด type ที่ชัดเจนกว่า
};

const Chart: React.FC<ClimateChartProps> = ({ meteorologicalData }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<"temperature" | "humidity" | "rain">("temperature");
  const [metricsData, setMetricsData] = useState<any>(null);
  const [showMinMax, setShowMinMax] = useState(false);

  useEffect(() => {
    const fetchData = async () => {

      // รวมข้อมูลจากทุกชั่วโมง
      const allRecords = meteorologicalData.flatMap((loc: any) => loc.meteorological_id);

      // จัดกลุ่มตามวัน
      const grouped: Record<string, any[]> = {};
      allRecords.forEach((item: any) => {
        const key = `${item.day}/${item.month}/${item.year}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });

      // คำนวณ avg, min, max ของแต่ละตัวแปร
      const dailyStats = Object.entries(grouped).map(([date, items]) => {
        const temps = items.map((i: any) => i.temperaturde);
        const hums = items.map((i: any) => i.humidity);
        const rains = items.map((i: any) => i.rain);

        return {
          date,
          temperature: {
            avg: average(temps),
            min: Math.min(...temps),
            max: Math.max(...temps),
          },
          humidity: {
            avg: average(hums),
            min: Math.min(...hums),
            max: Math.max(...hums),
          },
          rain: {
            avg: average(rains),
            min: Math.min(...rains),
            max: Math.max(...rains),
          },
        };
      });

      setMetricsData(dailyStats);
    };

    fetchData();
  }, []);

  // ฟังก์ชันเฉลี่ย
  const average = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  // อัปเดตข้อมูลกราฟตาม selectedMetric
  useEffect(() => {
    if (!metricsData) return;

    const labels = metricsData.map((d: any) => d.date);
    const avgData = metricsData.map((d: any) => d[selectedMetric].avg);
    const minData = metricsData.map((d: any) => d[selectedMetric].min);
    const maxData = metricsData.map((d: any) => d[selectedMetric].max);

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

    setChartData({
      labels,
      datasets,
    });
  }, [selectedMetric, metricsData, showMinMax]);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Climate Data</h2>

      {/* ปุ่มเลือกตัวแปร */}
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
}


export default Chart;