'use client'

import React, { useState, useEffect, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import { FaDownload, FaCloudSun, FaThermometerHalf, FaTint, FaCloudShowersHeavy, FaWind, FaMapMarkerAlt } from "react-icons/fa"
import "react-datepicker/dist/react-datepicker.css"
// import WeatherChart from './WeatherChart'
import { useRouter } from "next/navigation";

// --- Interface Definitions ---
export interface hours3weather {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  temperaturde: number;
  humidity: number;
  slp: number;
  stationPressure: number;
  dewPoint: number;
  vaporPressure: number;
  rain: number;
  rain24h: number;
  windspeed10m: number;
  winddirdedtion10m: number;
  visibility: number | null; // Changed from number to number | null based on usage in downloadFullCSV
  date: Date;
}

export interface Weather {
  id: number;
  nameTH: string;
  nameEN: string;
  province: string;
  lat: number;
  long: number;
  stationNumber: string;
  data3hours_weather_id: hours3weather[];
}

export interface Location {
  id: number;
  name_location: string;
  date: Date;
  nameTH: string;
  nameEN: string;
  number_location: string;
  description: string;
  station_weather_id: Weather[];
}

type ViewMode = "day" | "week" | "month";
type WeatherVariable = 'temperaturde' | 'humidity' | 'rain' | 'windspeed10m' | 'slp';

// Type for the dynamic property access in downloadFullCSV
type WeatherDataKey = keyof hours3weather;

function Page() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedVariable, setSelectedVariable] = useState<WeatherVariable>('temperaturde');
  const [filteredData, setFilteredData] = useState<hours3weather[]>([]);
  const router = useRouter();

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // เปลี่ยน fetch เป็น API endpoint จริงของคุณ
        const rs = await fetch("https://weather-cass.online/api/weather/3hoursweather");
        const data = await rs.json();

        const processedData: Location[] = data.map((loc: Location) => ({
          ...loc,
          date: new Date(loc.date),
          station_weather_id: loc.station_weather_id.map(weather => ({
            ...weather,
            data3hours_weather_id: weather.data3hours_weather_id.map(hourData => ({
              ...hourData,
              // Ensure hourData has a 'date' property if your filtering logic relies on it.
              // Assuming your API returns year, month, day, hours, we create the Date object here:
              date: new Date(hourData.year, hourData.month - 1, hourData.day, hourData.hours)
            }))
          }))
        }));

        setLocationData(processedData);

        if (processedData.length > 0) {
          const defaultRegion = processedData[0];
          setSelectedRegion(defaultRegion.id.toString());
          if (defaultRegion.station_weather_id.length > 0) {
            setSelectedStation(defaultRegion.station_weather_id[0].id.toString());
            // ตั้งวันที่เริ่มต้นเป็นวันที่ล่าสุดจากข้อมูล
            const latestDate = processedData[0].station_weather_id[0].data3hours_weather_id
                .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.date || new Date();
            setSelectedDate(latestDate);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  
  const selectedStationData = useMemo(() => {
    return locationData
      .find(r => r.id.toString() === selectedRegion)
      ?.station_weather_id.find(st => st.id.toString() === selectedStation);
  }, [locationData, selectedRegion, selectedStation]);

  useEffect(() => {
    if (selectedStationData && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();

      let filtered: hours3weather[] = [];
      const allStationData = selectedStationData.data3hours_weather_id;

      if (viewMode === "day") {
        filtered = allStationData.filter(
          d => d.year === year && d.month === month && d.day === day
        );
      } else if (viewMode === "week") {
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        filtered = allStationData.filter(d => {
          // Data object already contains a 'date' property created in fetchData
          return d.date.getTime() >= startDate.getTime() && d.date.getTime() <= endDate.getTime();
        });
      } else if (viewMode === "month") {
        filtered = allStationData.filter(
          d => d.year === year && d.month === month
        );
      }

      setFilteredData(filtered.sort((a, b) => a.date.getTime() - b.date.getTime()));
    } else {
      setFilteredData([]);
    }
  }, [selectedStationData, selectedDate, viewMode]);

  // หาข้อมูลล่าสุดของสถานีที่เลือก (Current Data)
  const latestStationData = useMemo(() => {
    if (!selectedStationData) return null;
    const sorted = [...selectedStationData.data3hours_weather_id].sort((a, b) => {
      // Use the pre-calculated 'date' property
      return b.date.getTime() - a.date.getTime();
    });

    return sorted.length > 0 ? sorted[0] : null;
  }, [selectedStationData]);

  const availableDates = selectedStationData
    ? Array.from(new Set(selectedStationData.data3hours_weather_id.map(
      d => new Date(d.year, d.month - 1, d.day).getTime()
    )))
      .map(t => new Date(t))
    : [];

  const getVariableDetails = (variable: WeatherVariable) => {
    switch (variable) {
      case 'temperaturde': return { label: 'อุณหภูมิ (°C)', icon: FaThermometerHalf, color: 'red' };
      case 'humidity': return { label: 'ความชื้น (%)', icon: FaTint, color: 'blue' };
      case 'rain': return { label: 'ปริมาณฝน (มม./ชม.)', icon: FaCloudShowersHeavy, color: 'green' };
      case 'windspeed10m': return { label: 'ความเร็วลม (m/s)', icon: FaWind, color: 'purple' };
      case 'slp': return { label: 'ความกดอากาศ (hPa)', icon: FaMapMarkerAlt, color: 'orange' };
      default: return { label: '', icon: FaThermometerHalf, color: 'red' };
    }
  };

const downloadFullCSV = () => {
  if (!localStorage.getItem("token")) {
    alert("กรุณาเข้าสู่ระบบก่อนดาวน์โหลด");
    router.push("/user/login"); // Use router.push instead of window.location.href
    return;
  }

  if (!selectedStationData || selectedStationData.data3hours_weather_id.length === 0) {
    alert("No data available for download");
    return;
  }

  // หัวตาราง (ทั้งหมด)
  const headers = [
    "Year",
    "Month",
    "Day",
    "Hours",
    "Temperature (°C)",
    "Humidity (%)",
    "Pressure (hPa)",
    "Station Pressure (hPa)",
    "Dew Point (°C)",
    "Vapor Pressure",
    "Rain (mm/hr)",
    "Rain24h (mm)",
    "Wind Speed (m/s)",
    "Wind Direction",
    "Visibility (m)",
  ];

  const rows = selectedStationData.data3hours_weather_id.map(d => [
    d.year,
    d.month,
    d.day,
    d.hours,
    d.temperaturde.toFixed(1),
    d.humidity.toFixed(1),
    d.slp.toFixed(2),
    d.stationPressure.toFixed(2),
    d.dewPoint.toFixed(1),
    d.vaporPressure.toFixed(2),
    d.rain.toFixed(1),
    d.rain24h.toFixed(1),
    d.windspeed10m.toFixed(1),
    d.winddirdedtion10m,
    d.visibility ?? "-",
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");

  const stationNameEN = selectedStationData?.nameEN?.replace(/\s+/g, "_") || "station";
  const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : "date";
  const filename = `weather_full_${stationNameEN}_${dateStr}.csv`;

  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  const noDataMessage = (
    <div className="text-center p-12 bg-gray-100 rounded-lg border-dashed border-2 border-gray-300 text-gray-500 text-lg">
      <FaCloudSun className="text-4xl mx-auto mb-4 text-gray-400" />
      <p>⚠️ กรุณาเลือกสถานีและวันที่ที่ต้องการดูข้อมูล</p>
      {selectedStation && filteredData.length === 0 && (
          <p className="mt-2 text-sm">ไม่พบข้อมูลสภาพอากาศในช่วงเวลาที่เลือก ({viewMode})</p>
      )}
    </div>
  );

  const isStationSelected = !!selectedStation;
  const hasFilteredData = filteredData.length > 0;


  return (
    <div className="container mx-auto p-4">
      <p className="text-4xl font-bold mb-6 text-gray-800">ข้อมูลสภาพอากาศราย 3 ชั่วโมง 🌤️</p>
      <hr className="mb-6" />

      <div className="flex flex-wrap gap-4 items-end p-4 bg-blue-50 rounded-lg shadow-md mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">เลือกภูมิภาค:</label>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedStation('');
              setSelectedDate(null); 
            }}
            className="border border-gray-300 rounded-md p-2 mt-1 w-48"
          >
            <option value="">-- เลือกภูมิภาค --</option>
            {locationData.map(region => (
              <option key={region.id} value={region.id}>{region.nameTH}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">เลือกสถานี:</label>
          <select
            value={selectedStation}
            onChange={(e) => {
                setSelectedStation(e.target.value);
                setSelectedDate(null);
            }}
            className="border border-gray-300 rounded-md p-2 mt-1 w-48"
            disabled={!selectedRegion}
          >
            <option value="">-- เลือกสถานี --</option>
            {locationData.find(r => r.id.toString() === selectedRegion)?.station_weather_id.map(station => (
              <option key={station.id} value={station.id}>
                {station.nameTH} ({station.province})
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">เลือกวันที่:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 rounded-md p-2 mt-1 w-36"
            placeholderText="เลือกวันที่"
            disabled={!selectedStation || availableDates.length === 0}
            includeDates={availableDates}
            highlightDates={availableDates}
          />
        </div>

        {/* Mode */}
        <div className="flex gap-2">
          <button onClick={() => setViewMode("day")} className={`px-4 py-2 rounded-md ${viewMode === "day" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>รายวัน</button>
          <button onClick={() => setViewMode("week")} className={`px-4 py-2 rounded-md ${viewMode === "week" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>รายสัปดาห์</button>
          <button onClick={() => setViewMode("month")} className={`px-4 py-2 rounded-md ${viewMode === "month" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>รายเดือน</button>
        </div>
      </div>

  
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">ข้อมูลปัจจุบัน</h2>
        {latestStationData && selectedStationData && hasFilteredData ? (
          <div className="p-6 border rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-white">
            <div>
              <p className="text-xl font-bold text-gray-800">{selectedStationData.nameTH}</p>
              <p className="text-lg text-gray-600">{selectedStationData.province}</p>
              <p className="text-sm text-gray-500">
                อัปเดต: {latestStationData.day.toString().padStart(2, '0')}/{latestStationData.month.toString().padStart(2, '0')}/{latestStationData.year} {latestStationData.hours.toString().padStart(2, '0')}:00 น.
              </p>
            </div>
            <div className="text-center">
              <FaCloudSun className="text-5xl text-yellow-500 mx-auto mb-2" />
              <p className="text-4xl font-extrabold text-red-600">{latestStationData.temperaturde.toFixed(1)}°C</p>
              <p className="mt-1 text-lg font-semibold text-gray-700">อุณหภูมิ</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-blue-600">{latestStationData.humidity.toFixed(1)}%</p>
              <p className="mt-1 text-lg font-semibold text-gray-700">ความชื้น</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-green-600">{latestStationData.rain.toFixed(1)} มม.</p>
              <p className="mt-1 text-lg font-semibold text-gray-700">ฝน (ราย ชม.)</p>
            </div>
          </div>
        ) : (
            noDataMessage
        )}
      </div>

      <hr className="my-8" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">กราฟข้อมูลสภาพอากาศ ({viewMode})</h2>
        {isStationSelected && hasFilteredData && (
            <div className="flex flex-wrap gap-3 mb-4">
              {/* 🛑 FIX: Removed unused 'setSelectedVariable' warning by keeping it used */}
              {[
                { key: 'temperaturde', label: 'อุณหภูมิ', icon: FaThermometerHalf },
                { key: 'humidity', label: 'ความชื้น', icon: FaTint },
                { key: 'rain', label: 'ปริมาณฝน', icon: FaCloudShowersHeavy },
                { key: 'windspeed10m', label: 'ความเร็วลม', icon: FaWind },
                { key: 'slp', label: 'ความกดอากาศ', icon: FaMapMarkerAlt },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedVariable(item.key as WeatherVariable)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition duration-150 ${selectedVariable === item.key ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  <item.icon /> {item.label}
                </button>
              ))}
            </div>
        )}
        
{/*         <div className="border p-4 rounded-lg shadow-lg bg-white">
          {isStationSelected && hasFilteredData ? (
            <WeatherChart
              filteredData={filteredData}
              viewMode={viewMode}
              selectedVariable={selectedVariable}
              getVariableDetails={getVariableDetails}
            />
          ) : (
            noDataMessage
          )}
        </div> */}
      </div>

      <hr className="my-8" />

      {/* ตาราง */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-semibold text-gray-700">ตารางข้อมูลสภาพอากาศ ({viewMode})</h2>
    <button
      onClick={downloadFullCSV}
      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
    >
      <FaDownload /> ดาวน์โหลด CSV
    </button>
  </div>

        {/* 🛑 FIX: Removed duplicate h2 tag */}
        {/* <h2 className="text-2xl font-semibold mb-4 text-gray-700">ตารางข้อมูลสภาพอากาศ ({viewMode})</h2> */}
        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-lg border">
          {isStationSelected && hasFilteredData ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">วัน-เวลา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">อุณหภูมิ (°C)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ความชื้น (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ความกดอากาศ (hPa)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">จุดน้ำค้าง (°C)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ฝน (มม./ชม.)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ความเร็วลม (m/s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ทัศนวิสัย (m)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((d, idx) => (
                  <tr key={idx} className="hover:bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {d.day.toString().padStart(2, '0')}/{d.month.toString().padStart(2, '0')} {d.hours.toString().padStart(2, '0')}:00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.temperaturde.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.humidity.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.slp.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.dewPoint.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{d.rain.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.windspeed10m.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.visibility ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            noDataMessage
          )}
        </div>
      </div>
    </div>
  );
}

export default Page