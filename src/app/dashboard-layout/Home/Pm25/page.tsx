"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

const LeafletMap = dynamic(() => import("./pm25map"), { ssr: false });

interface Pollutant {
  id: number;
  color_id: number;
  aqi: number;
  value: number;
}

interface LastAqi {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  createdAt: string;
  pm25_id?: Pollutant[];
  pm10_id?: Pollutant[];
  o3_id?: Pollutant[];
  co_id?: Pollutant[];
  no2_id?: Pollutant[];
  so2_id?: Pollutant[];
  api?: Pollutant[];
}

interface LocationData {
  id: number;
  areaTH: string;
  areaEN: string;
  nameTH: string;
  nameEN: string;
  stationType: string;
  stationNumber: string;
  lat: string;
  long: string;
  lastaqi_id?: LastAqi[];
  latestData?: LastAqi | null;
}

export default function HomePage() {
  const [stations, setStations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStations, setFilteredStations] = useState<LocationData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://weather-cass.online/api/latest");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const jsondata: LocationData[] = await response.json();

        const latest = jsondata.map((station) => {
          const latestData =
            Array.isArray(station.lastaqi_id) && station.lastaqi_id.length > 0
              ? station.lastaqi_id[0]
              : null;
          return { ...station, latestData };
        });

        setStations(latest);
        setFilteredStations(latest); // แสดงทั้งหมดตอนเริ่ม
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const filtered = stations.filter(
      (s) =>
        s.nameTH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nameEN?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStations(filtered);
  };

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
          href="/dashboard-layout/Home"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <p><FaArrowLeft  />กลับไปหน้าหลัก</p>
        </Link>

        {/* ช่องค้นหา + ปุ่มค้นหา */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="ค้นหาสถานี..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ค้นหา
          </button>
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-blue-700">
        ข้อมูลคุณภาพอากาศ (AQI) ล่าสุด
      </h1>

      <div className="mb-12 h-96 rounded-lg overflow-hidden shadow-lg">
        <LeafletMap locationdata={filteredStations} />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b-2 border-blue-200 pb-2">
          ✨ รายการสถานีที่มีข้อมูลล่าสุด
        </h2>

        {filteredStations.length === 0 ? (
          <p className="text-gray-600 text-center text-lg mt-8">
            ไม่พบสถานีที่ตรงกับคำค้น
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStations.map((station, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <h3 className="font-extrabold text-xl text-indigo-700 mb-3">
                  📍 {station.nameTH}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  อัปเดต: {station.latestData?.hours ?? "-"}:00 น.
                </p>
                {station.latestData ? (
                  <div className="space-y-2 text-base text-gray-700">
                    <p>
                      🌫️ PM2.5:{" "}
                      <span className="font-semibold text-blue-600">
                        {Array.isArray(station.latestData.pm25_id) &&
                        station.latestData.pm25_id.length > 0
                          ? station.latestData.pm25_id[0]?.value
                          : "-"}{" "}
                        µg/m³ (AQI{" "}
                        {Array.isArray(station.latestData.pm25_id) &&
                        station.latestData.pm25_id.length > 0
                          ? station.latestData.pm25_id[0]?.aqi
                          : "-"}
                        )
                      </span>
                    </p>
                    <p>
                      🌫️ PM10:{" "}
                      <span className="font-semibold text-purple-600">
                        {Array.isArray(station.latestData.pm10_id) &&
                        station.latestData.pm10_id.length > 0
                          ? station.latestData.pm10_id[0]?.value
                          : "-"}{" "}
                        µg/m³
                      </span>
                    </p>
                    <p>
                      🟢 AQI รวม:{" "}
                      <span className="font-semibold text-green-600">
                        {Array.isArray(station.latestData.api) &&
                        station.latestData.api.length > 0
                          ? station.latestData.api[0]?.aqi
                          : "-"}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">ไม่มีข้อมูลล่าสุด</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
