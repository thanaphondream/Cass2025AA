// // "use client";

// // import { useEffect, useState } from "react";
// // import { Line } from "react-chartjs-2";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend
// // );

// // export default function AirChartPM25() {
// //   const [chartData, setChartData] = useState<any>(null);
// //   const [Maxpm25, setMaxpm25] = useState<number>(0);
// //   const [Minpm25, setMinpm25] = useState<number>(Infinity);
// //   const [chartMoth, setChartMonth] = useState<any>(null);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       const res = await fetch("http://10.90.1.118:3001/api/airpm/2025/8/12/2");
// //       const data = await res.json();

// //       const labels = data.map((item: any) => `${item.hours}:00`);

// //       const pm25 = data.map((item: any) =>
// //         item.pm25_id.length > 0 ? item.pm25_id[0].value : null
// //       );



// //       const pmMax = pm25.reduce((max: number, value: number | null) => {
// //         if (value !== null && value > max) { 
// //           return value;
// //         }
// //         return max;
// //       }, 0);

// //       setMaxpm25(pmMax);
// //       setMinpm25(pm25.reduce((min: number, value: number | null) => {
// //         if (value !== null && value < min) {
// //           return value;
// //         }
// //         return min;
// //       }, Infinity));

// //     // const pmMin = pm25.reduce((min: number, value: number | null) => {
// //     //   if (value !== null && value < min) {
// //     //     return value;
// //     //   }
// //     //   return min;
// //     // }, Infinity);


// //       setChartData({
// //         labels,
// //         datasets: [
// //           {
// //             label: "PM2.5",
// //             data: pm25,
// //             borderColor: "rgba(0, 170, 255, 1)",       // สีฟ้าเหมือนรูป
// //             backgroundColor: "rgba(0, 170, 255, 0.3)", // สีฟ้าอ่อนโปร่ง
// //             tension: 0.4, 
// //             pointRadius: 5, 
// //             fill: false,
// //           },
// //         ],
// //       });

// //       setChartMonth({
// //         labels,
// //         datasets: [
// //           {
// //             label: "PM2.5",
// //             data: pm25,
// //             borderColor: "rgba(0, 150, 255, 1)",       // สีฟ้าเหมือนรูป
// //             backgroundColor: "rgba(0, 150, 255, 0.3)", // สีฟ้าอ่อนโปร่ง
// //             tension: 0.4, 
// //             pointRadius: 5, 
// //             fill: false,
// //           },
// //         ],
// //     })
// //     };


// //     fetchData();
// //   }, []);

// //   const options = {
// //     responsive: true,
// //     plugins: {
// //       legend: { display: false }, 
// //     },
// //     scales: {
// //       y: {
// //         min: Minpm25 - 1,
// //         max: Maxpm25 + 1, 
// //         ticks: {
// //           stepSize: 1,
// //         },
// //       },
// //     },
// //   };



// //   return (
// //     <div className="p-4">
// //       <h2 className="text-xl font-bold mb-4">Bangna PM2.5</h2>
// //       {chartData ? (
// //         <Line data={chartData} options={options} />
// //       ) : (
// //         <p>Loading...</p>
// //       )}
// //     </div>
// //   );
// // }


// "use client";

// import { useEffect, useState } from "react";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function AirChartPM25() {
//   const [chartData, setChartData] = useState<any>(null);
//   const [dailyStats, setDailyStats] = useState<any[]>([]);
//   const [showMin, setShowMin] = useState<boolean>(false);
//   const [showMax, setShowMax] = useState<boolean>(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await fetch("http://10.90.1.118:3001/api/airpm/2025/8/Bangna");
//       const data = await res.json();

//       // ✅ Group ข้อมูลตามวัน
//       const grouped: Record<string, number[]> = {};
//       data.forEach((item: any) => {
//         const key = `${item.day}/${item.month}/${item.year}`;
//         const pmValue = item.pm25_id.length > 0 ? item.pm25_id[0].value : null;
//         if (pmValue === null) return;
//         if (!grouped[key]) grouped[key] = [];
//         grouped[key].push(pmValue);
//       });

//       // ✅ คำนวณ Min/Max และ Avg
//       const stats = Object.entries(grouped).map(([date, values]) => ({
//         date,
//         min: Math.min(...values),
//         max: Math.max(...values),
//         avg: values.reduce((sum, val) => sum + val, 0) / values.length,
//       }));
//       setDailyStats(stats);

//       // ✅ Default Chart = Average
//       const labels = stats.map((s) => s.date);
//       const avgValues = stats.map((s) => s.avg);

//       setChartData({
//         labels,
//         datasets: [
//           {
//             label: "ค่าเฉลี่ย",
//             data: avgValues,
//             borderColor: "rgba(0, 170, 255, 1)",
//             backgroundColor: "rgba(0, 170, 255, 0.3)",
//             tension: 0.4,
//             pointRadius: 4,
//           },
//         ],
//       });
//     };

//     fetchData();
//   }, []);

//   const updateChart = () => {
//     if (!dailyStats.length) return;

//     const labels = dailyStats.map((s) => s.date);
//     const avgValues = dailyStats.map((s) => s.avg);
//     const minValues = dailyStats.map((s) => s.min);
//     const maxValues = dailyStats.map((s) => s.max);

//     const datasets: any[] = [
//       {
//         label: "ค่าเฉลี่ย",
//         data: avgValues,
//         borderColor: "rgba(0, 170, 255, 1)",
//         backgroundColor: "rgba(0, 170, 255, 0.3)",
//         tension: 0.4,
//         pointRadius: 4,
//       },
//     ];

//     if (showMin) {
//       datasets.push({
//         label: "ค่าต่ำสุด",
//         data: minValues,
//         borderColor: "rgba(0, 200, 100, 1)",
//         backgroundColor: "rgba(0, 200, 100, 0.3)",
//         borderDash: [5, 5], // เส้นประ
//         tension: 0.4,
//         pointRadius: 4,
//       });
//     }

//     if (showMax) {
//       datasets.push({
//         label: "ค่าสูงสุด",
//         data: maxValues,
//         borderColor: "rgba(255, 99, 132, 1)",
//         backgroundColor: "rgba(255, 99, 132, 0.3)",
//         borderDash: [5, 5], // เส้นประ
//         tension: 0.4,
//         pointRadius: 4,
//       });
//     }

//     setChartData({ labels, datasets });
//   };

//   useEffect(updateChart, [showMin, showMax, dailyStats]);

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { display: true },
//     },
//     scales: {
//       y: {
//         beginAtZero: false,
//       },
//     },
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Bangna PM2.5</h2>
//       <div className="flex gap-4 mb-4">
//         <button
//           onClick={() => setShowMin((prev) => !prev)}
//           className={`px-4 py-2 rounded ${
//             showMin ? "bg-green-500 text-white" : "bg-gray-200"
//           }`}
//         >
//           {showMin ? "ซ่อน Min" : "แสดง Min"}
//         </button>
//         <button
//           onClick={() => setShowMax((prev) => !prev)}
//           className={`px-4 py-2 rounded ${
//             showMax ? "bg-red-500 text-white" : "bg-gray-200"
//           }`}
//         >
//           {showMax ? "ซ่อน Max" : "แสดง Max"}
//         </button>
//       </div>

//       {chartData ? <Line data={chartData} options={options} /> : <p>Loading...</p>}
//     </div>
//   );
// }

"use client";

import React from "react";

const TestChartPage = () => {
  return (
    <div>
      <h1>Test Chart Page</h1>
    </div>
  );
};

export default TestChartPage;