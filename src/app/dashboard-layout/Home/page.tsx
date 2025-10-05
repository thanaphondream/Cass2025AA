"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaSmog } from "react-icons/fa";

const LeafletMap = dynamic(() => import("./LeafletMep"), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
      กำลังโหลดแผนที่...
    </div>
  ),
});

interface WeatherData {
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
  lowcloud: number;
  highcloud: number;
  visibility: number;
  date: string;
}

interface LocationData {
  id: number;
  nameTH: string;
  nameEN: string;
  province: string;
  lat: string;
  long: string;
  stationNumber: string;
  data3hours_weather_id: WeatherData[];
}

interface LatestLocation extends LocationData {
  latestData: WeatherData;
}

export default function HomePage() {
  const [locationdata, setLocationdata] = useState<LocationData[]>([]);
  const [latestLocations, setLatestLocations] = useState<LatestLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:3001/api/weatherstationnow");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const jsondata: LocationData[] = await response.json();
        setLocationdata(jsondata);

        const latest: LatestLocation[] = jsondata
          .map((loc) => {
            if (loc.data3hours_weather_id && loc.data3hours_weather_id.length > 0) {
              const latestData = loc.data3hours_weather_id.reduce((prev, current) => {
                const prevDate = new Date(prev.date);
                const currDate = new Date(current.date);
                return currDate > prevDate ? current : prev;
              });
              return { ...loc, latestData };
            }
            return null;
          })
          .filter((loc): loc is LatestLocation => loc !== null);

        setLatestLocations(latest);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLocations = latestLocations.filter(
    (loc) =>
      loc.nameTH.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.nameEN.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard-layout/Home/Pm25"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <p className="flex gap-2"><FaSmog />ดูข้อมูลpm2.5</p>
        </Link>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="ค้นหาสถานี..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ค้นหา
          </button>
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-blue-700 animate-fade-in-down">
        ค่าพยากรอากาศในแต่ละสถานี
      </h1>

      <div className="mb-12 h-96 rounded-lg overflow-hidden shadow-lg">
        <LeafletMap locationdata={locationdata} />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b-2 border-blue-200 pb-2">
          ✨ สถานีที่มีข้อมูลล่าสุด
        </h2>

        {filteredLocations.length === 0 ? (
          <p className="text-gray-600 text-center text-lg mt-8">ไม่พบสถานีที่ตรงกับคำค้น</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <h3 className="font-extrabold text-2xl text-indigo-700 mb-3 border-b-2 border-indigo-100 pb-2">
                  📍 {loc.nameTH}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  🕒 อัปเดตล่าสุด:{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(loc.latestData.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    เวลา {String(loc.latestData.hours).padStart(2, "0")}:00 น.
                  </span>
                </p>
                <div className="space-y-2 text-base text-gray-700">
                  <p>
                    🌡️ อุณหภูมิ:{" "}
                    <span className="font-semibold text-blue-600">
                      {loc.latestData.temperaturde}°C
                    </span>
                  </p>
                  <p>
                    💧 ความชื้น:{" "}
                    <span className="font-semibold text-teal-600">
                      {loc.latestData.humidity}%
                    </span>
                  </p>
                  <p>
                    🌧️ ปริมาณฝน:{" "}
                    <span
                      className={`font-semibold ${
                        loc.latestData.rain > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {loc.latestData.rain} มม.
                    </span>
                  </p>
                  <p>
                    💨 ความเร็วลม:{" "}
                    <span className="font-semibold text-purple-600">
                      {loc.latestData.windspeed10m} ม./วินาที
                    </span>
                  </p>
                  <p>
                    🧭 ทิศทางลม:{" "}
                    <span className="font-semibold text-orange-600">
                      {loc.latestData.winddirdedtion10m}°
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
