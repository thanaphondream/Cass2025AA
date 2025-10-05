'use client'

import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { FaDownload, FaCloudSun, FaThermometerHalf, FaTint, FaCloudShowersHeavy, FaWind, FaMapMarkerAlt, FaSmog, FaExclamationTriangle } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

// --- Interface Definitions ---
export interface So2 {
  id: number;
  so2_name: string;
  so2: number;
  aod: number;
  o3: number;
  flag: number;
}

export interface No2 {
  id: number;
  no2_name: string;
  no2: number;
  aod: number;
  o3: number;
  flag: number;
  slant: number | null;
}

export interface Choho {
  id: number;
  choho_name: string;
  choho: number;
  aod: number;
  o3: number;
  flag: number;
}

export interface Ges {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  so2_id: So2[];
  choho_id: Choho[];
  no2_id: No2[];
  date: Date;
}

export interface LocationGes {
  id: number;
  nameTH: string;
  nameEN: string;
  areaTH: string;
  areaEN: string;
  stationNumber: string;
  lat: string;
  long: string;
  ges_id: Ges[];
}

export interface Location {
  id: number;
  name_location: string;
  date: string;
  nameTH: string;
  nameEN: string;
  number_location: string;
  description: string;
  locationges_id: LocationGes[];
}

type ViewMode = "day" | "week" | "month";
type GasVariable = 'so2' | 'no2' | 'aod' | 'o3';
type No2Type = "so2" | "no2" | "choho";

const availableNo2Types: No2Type[] = ["so2", "no2", "choho"];

function GasDataPage() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedVariable, setSelectedVariable] = useState<GasVariable>('so2');
  const [selectedNo2Type, setSelectedNo2Type] = useState<No2Type>('so2');
  const [filteredData, setFilteredData] = useState<Ges[]>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rs = await fetch("http://weather-cass.online:3001/api/ShowData");
        const data: Location[] = await rs.json();

        const processedData: Location[] = data.map((loc: Location) => ({
          ...loc,
          locationges_id: loc.locationges_id.map(locGes => ({
            ...locGes,
            ges_id: locGes.ges_id.map(gesData => ({
              ...gesData,
              date: new Date(gesData.year, gesData.month - 1, gesData.day, gesData.hours)
            }))
          }))
        }));

        setLocationData(processedData);

        if (processedData.length > 0) {
          const defaultRegion = processedData[0];
          setSelectedRegion(defaultRegion.id.toString());
          if (defaultRegion.locationges_id.length > 0) {
            setSelectedStation(defaultRegion.locationges_id[0].id.toString());
            const latestDate = processedData[0].locationges_id[0].ges_id
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
      ?.locationges_id.find(st => st.id.toString() === selectedStation);
  }, [locationData, selectedRegion, selectedStation]);

  useEffect(() => {
    if (selectedStationData && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();

      let filtered: Ges[] = [];
      const allStationData = selectedStationData.ges_id;

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

  const latestStationData = useMemo(() => {
    if (!selectedStationData) return null;
    const sorted = [...selectedStationData.ges_id].sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted.length > 0 ? sorted[0] : null;
  }, [selectedStationData]);

  const availableDates = selectedStationData
    ? Array.from(new Set(selectedStationData.ges_id.map(
      d => new Date(d.year, d.month - 1, d.day).getTime()
    )))
      .map(t => new Date(t))
    : [];

  const noDataMessage = (
    <div className="text-center p-12 bg-gray-100 rounded-lg border-dashed border-2 border-gray-300 text-gray-500 text-lg">
      <FaExclamationTriangle className="text-4xl mx-auto mb-4 text-red-400" />
      <p>⚠️ กรุณาเลือกภูมิภาค สถานี และวันที่ที่ต้องการดูข้อมูล</p>
      {selectedStation && filteredData.length === 0 && (
        <p className="mt-2 text-sm">ไม่พบข้อมูลมลพิษในช่วงเวลาที่เลือก ({viewMode})</p>
      )}
    </div>
  );

  const latestValue = latestStationData?.[selectedNo2Type + "_id" as keyof Ges]?.[0] ?? null;

   const downloadCSV = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนดาวน์โหลด");
      router.push("/user/login");
      return;
    }

    if (!selectedStation || filteredData.length === 0) {
      alert("กรุณาเลือกสถานีและช่วงเวลาที่ต้องการก่อนดาวน์โหลด");
      return;
    }

    try {
      const headers = ["Date-Time", selectedNo2Type.toUpperCase(), "AOD", "O3"];

      const rows = filteredData.map(d => {
        const so2Data = d.so2_id[0] ?? {};
        const no2Data = d.no2_id[0] ?? {};
        const chohoData = d.choho_id[0] ?? {};

        const valueData =
          selectedNo2Type === "so2" ? so2Data :
          selectedNo2Type === "no2" ? no2Data : chohoData;

        return [
          `${d.day.toString().padStart(2, '0')}/${d.month.toString().padStart(2, '0')} ${d.hours.toString().padStart(2, '0')}:00`,
          valueData?.[selectedNo2Type] ?? "-",
          valueData?.aod ?? "-",
          valueData?.o3 ?? "-"
        ];
      });

      const csvContent =
        [headers, ...rows]
          .map(e => e.join(","))
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const filename = `GasData_${selectedStation}_${selectedNo2Type}_${new Date().toISOString().split("T")[0]}.csv`;

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.click();
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด CSV");
    }
  };

  

  return (
    <div className="container mx-auto p-4">
      <p className="text-4xl font-bold mb-6 text-gray-800">ข้อมูลมลพิษทางอากาศ 💨</p>
      <hr className="mb-6" />

      <div className="flex flex-wrap gap-4 items-end p-4 bg-yellow-50 rounded-lg shadow-md mb-8">
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
            {locationData.find(r => r.id.toString() === selectedRegion)?.locationges_id.map(station => (
              <option key={station.id} value={station.id}>
                {station.nameTH} ({station.areaTH})
              </option>
            ))}
          </select>
        </div>

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

        <div className="flex gap-2">
          <button onClick={() => setViewMode("day")} className={`px-4 py-2 rounded-md ${viewMode === "day" ? "bg-amber-600 text-white" : "bg-gray-200"}`}>รายวัน</button>
          <button onClick={() => setViewMode("week")} className={`px-4 py-2 rounded-md ${viewMode === "week" ? "bg-amber-600 text-white" : "bg-gray-200"}`}>รายสัปดาห์</button>
          <button onClick={() => setViewMode("month")} className={`px-4 py-2 rounded-md ${viewMode === "month" ? "bg-amber-600 text-white" : "bg-gray-200"}`}>รายเดือน</button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium text-gray-700">เลือกประเภท:</span>
          {availableNo2Types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedNo2Type(type)}
              className={`px-4 py-2 rounded-md ${selectedNo2Type === type ? "bg-red-500 text-white" : "bg-gray-200"}`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>


      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">ข้อมูลปัจจุบัน</h2>
        {latestStationData && selectedStationData && filteredData.length > 0 ? (
          <div className="p-6 border rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-white">
            <div>
              <p className="text-xl font-bold text-gray-800">{selectedStationData.nameTH}</p>
              <p className="text-lg text-gray-600">{selectedStationData.areaTH}</p>
              <p className="text-sm text-gray-500">
                อัปเดต: {latestStationData.day.toString().padStart(2, '0')}/{latestStationData.month.toString().padStart(2, '0')}/{latestStationData.year} {latestStationData.hours.toString().padStart(2, '0')}:00 น.
              </p>
            </div>
            <div className="text-center">
              <FaSmog className="text-5xl text-yellow-500 mx-auto mb-2" />
              <p className="text-4xl font-extrabold text-amber-600">{latestValue?.[selectedNo2Type]?.toFixed(2) ?? '-'}</p>
              <p className="mt-1 text-lg font-semibold text-gray-700">{selectedNo2Type.toUpperCase()}</p>
            </div>
          </div>
        ) : (
          noDataMessage
        )}
      </div>

      {/* ตาราง */}
      <div className="mb-8">
         <div className="flex justify-end mb-4">
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          <FaDownload /> ดาวน์โหลด CSV
        </button>
      </div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">ตารางข้อมูลมลพิษ ({viewMode})</h2>
        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-lg border">
          {selectedStation && filteredData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">วัน-เวลา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{selectedNo2Type.toUpperCase()}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">AOD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">O3</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((d, idx) => {
                  const so2Data = d.so2_id[0] ?? {};
                  const no2Data = d.no2_id[0] ?? {};
                  const chohoData = d.choho_id[0] ?? {};
                  const valueData = selectedNo2Type === "so2"
                    ? so2Data
                    : selectedNo2Type === "no2"
                      ? no2Data
                      : chohoData;

                  return (
                    <tr key={idx} className="hover:bg-yellow-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {d.day.toString().padStart(2, '0')}/{d.month.toString().padStart(2, '0')} {d.hours.toString().padStart(2, '0')}:00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-600">{valueData?.[selectedNo2Type]?.toFixed(2) ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{valueData?.aod?.toFixed(2) ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{valueData?.o3?.toFixed(2) ?? '-'}</td>
                    </tr>
                  )
                })}
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

export default GasDataPage;
