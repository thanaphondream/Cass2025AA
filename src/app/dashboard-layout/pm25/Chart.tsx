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

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// // state สำหรับเก็บข้อมูลกราฟ
// const [dayChartData, setDayChartData] = useState<any>(null);
// const [monthChartData, setMonthChartData] = useState<any>(null);
// const [yearChartData, setYearChartData] = useState<any>(null);

// const prepareChartData = (data: Air4[]) => {
//   const labels = data.map((d) => `${d.day}/${d.month}`);
//   const pm25Values = data.map((d) => d.pm25_id?.[0]?.value ?? null);
//   const pm10Values = data.map((d) => d.pm10_id?.[0]?.value ?? null);

//   return {
//     labels,
//     datasets: [
//       {
//         label: "PM2.5",
//         data: pm25Values,
//         borderColor: "rgba(255, 99, 132, 1)",
//         backgroundColor: "rgba(255, 99, 132, 0.2)",
//       },
//       {
//         label: "PM10",
//         data: pm10Values,
//         borderColor: "rgba(54, 162, 235, 1)",
//         backgroundColor: "rgba(54, 162, 235, 0.2)",
//       },
//     ],
//   };
// };

// const Day_dataPm = async () => {
//   try {
//     if (idlocation === 0 || !selectedDate) {
//       alert("กรุณากรอกข้อมูลให้ครบถ้วน");
//       return;
//     }
//     const rs = await fetch(
//       `https://cass-api-data.vercel.app/api/airpm/${selectedDate.getFullYear()}/${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${idlocation}`
//     );
//     const rs_json = await rs.json();
//     const dataArray = Array.isArray(rs_json) ? rs_json : [rs_json];
//     setDayDataAir4(dataArray);
//     setDayChartData(prepareChartData(dataArray));
//     setMonthDataAir4([]);
//     setYearDataAir4([]);
//   } catch (err) {
//     console.error(err);
//   }
// };

// const Month_dataPm = async () => {
//   try {
//     if (idlocation === 0 || !selectedDate) {
//       alert("กรุณากรอกข้อมูลให้ครบถ้วน");
//       return;
//     }
//     const rs = await fetch(
//       `https://cass-api-data.vercel.app/api/airpm/${selectedDate.getFullYear()}/${selectedDate.getMonth() + 1}/${namelocation}`
//     );
//     const rs_json = await rs.json();
//     const dataArray = Array.isArray(rs_json) ? rs_json : [rs_json];
//     setMonthDataAir4(dataArray);
//     setMonthChartData(prepareChartData(dataArray));
//     setDayDataAir4([]);
//     setYearDataAir4([]);
//   } catch (err) {
//     console.error(err);
//   }
// };

// const Year_dataPm = async () => {
//   try {
//     if (idlocation === 0 || !selectedDate) {
//       alert("กรุณากรอกข้อมูลให้ครบถ้วน");
//       return;
//     }
//     const rs = await fetch(
//       `https://cass-api-data.vercel.app/api/airpm/${selectedDate.getFullYear()}/${namelocation}`
//     );
//     const rs_json = await rs.json();
//     const dataArray = Array.isArray(rs_json) ? rs_json : [rs_json];
//     setYearDataAir4(dataArray);
//     setYearChartData(prepareChartData(dataArray));
//     setMonthDataAir4([]);
//     setDayDataAir4([]);
//   } catch (err) {
//     console.error(err);
//   }
// };
