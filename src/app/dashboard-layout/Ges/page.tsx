'use client'

import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { FaDownload, FaChartLine, FaExclamationTriangle, FaMapMarkerAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

// --- INTERFACES (Kept intact for data structure integrity) ---

interface BaseGas {
  id: number;
  aod: number;
  o3: number;
  flag: number;
}

export interface So2 extends BaseGas {
  so2_name: string;
  so2: number;
}

export interface No2 extends BaseGas {
  no2_name: string;
  no2: number;
  slant: number | null;
}

export interface Choho extends BaseGas {
  choho_name: string;
  choho: number;
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

// --- TYPES ---

type ViewMode = "day" | "week" | "month";
type GasType = 'so2' | 'no2' | 'choho'; // Renamed No2Type to GasType for clarity

const availableGasTypes: GasType[] = ["so2", "no2", "choho"];

type GasDataElement = So2 | No2 | Choho;
type GasDataElementOrNull = GasDataElement | null;

// -------------------------------------------------------------
// HELPER FUNCTION: Type-safe lookup for dynamic gas property (Improved type signature)
// -------------------------------------------------------------
/**
 * Lookup the main gas value (so2, no2, or choho) from the specific gas object.
 */
function getGasValue(data: GasDataElementOrNull, type: GasType): number | null {
    if (!data) return null;

    if (type === 'so2' && 'so2' in data) {
        return data.so2;
    }
    if (type === 'no2' && 'no2' in data) {
        return data.no2;
    }
    if (type === 'choho' && 'choho' in data) {
        return data.choho;
    }
    return null;
}
// -------------------------------------------------------------

function GasDataPage() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedGasType, setSelectedGasType] = useState<GasType>('so2'); // Updated state name
  const [filteredData, setFilteredData] = useState<Ges[]>([]);
  const router = useRouter();

  // --- EFFECT: Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rs = await fetch("http://localhost:3001/api/ShowData");
        const rawData: unknown = await rs.json();
        if (!Array.isArray(rawData)) {
            console.error("Fetched data is not an array.");
            return;
        }

        const processedData: Location[] = rawData.map((loc: any) => ({
          ...loc,
          locationges_id: loc.locationges_id.map((locGes: any) => ({
            ...locGes,
            ges_id: locGes.ges_id.map((gesData: any) => ({
              ...gesData,
              // Convert raw Y/M/D/H to a proper Date object
              date: new Date(gesData.year, gesData.month - 1, gesData.day, gesData.hours)
            }))
          }))
        }));

        setLocationData(processedData);

        // Set initial defaults
        if (processedData.length > 0) {
          const defaultRegion = processedData[0];
          setSelectedRegion(defaultRegion.id.toString());
          if (defaultRegion.locationges_id.length > 0) {
            const defaultStation = defaultRegion.locationges_id[0];
            setSelectedStation(defaultStation.id.toString());
            // Find the latest available date for the default station
            const latestDate = defaultStation.ges_id
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

  // --- MEMO: Selected Station Data ---
  const selectedStationData = useMemo(() => {
    return locationData
      .find(r => r.id.toString() === selectedRegion)
      ?.locationges_id.find(st => st.id.toString() === selectedStation);
  }, [locationData, selectedRegion, selectedStation]);

  // --- EFFECT: Filter Data Based on View Mode/Date ---
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
        // Calculate the last 7 days including the selected day
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - 6); // Includes 7 days total (today + 6 previous)
        startDate.setHours(0, 0, 0, 0);

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

  // --- MEMO: Latest Gas Value for Current Data Card ---
  const latestGasDataElement = useMemo(() => {
    if (!selectedStationData) return null;
    
    // Get the very latest recorded GES data from the station
    const sortedGes = [...selectedStationData.ges_id].sort((a, b) => b.date.getTime() - a.date.getTime());
    const latestGes = sortedGes.length > 0 ? sortedGes[0] : null;

    if (!latestGes) return null;

    // Dynamically select the correct array based on selectedGasType
    const key = `${selectedGasType}_id` as 'so2_id' | 'no2_id' | 'choho_id';
    const valueArray = latestGes[key];

    // Return the first element of that array (which contains the actual gas data)
    return valueArray.length > 0 ? valueArray[0] as GasDataElement : null;
  }, [selectedStationData, selectedGasType]);

  // --- MEMO: Available Dates for Date Picker ---
  const availableDates = selectedStationData
    ? Array.from(new Set(selectedStationData.ges_id.map(
      d => new Date(d.year, d.month - 1, d.day).getTime()
    )))
      .map(t => new Date(t))
    : [];

  // --- HANDLER: Download CSV ---
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
      const headers = ["Date-Time", selectedGasType.toUpperCase(), "AOD", "O3"];

      const rows = filteredData.map((d: Ges) => {
        // Safely extract the gas data object based on the selected type
        const gasDataArray = d[`${selectedGasType}_id` as 'so2_id' | 'no2_id' | 'choho_id'];
        const valueData: GasDataElementOrNull = gasDataArray[0] ?? null;

        const gasValue = getGasValue(valueData, selectedGasType);
        const aodValue = valueData?.aod ?? null;
        const o3Value = valueData?.o3 ?? null;

        return [
          // Format: DD/MM HH:00
          `${d.day.toString().padStart(2, '0')}/${d.month.toString().padStart(2, '0')} ${d.hours.toString().padStart(2, '0')}:00`,
          gasValue !== null ? gasValue.toFixed(2) : "-",
          aodValue !== null ? aodValue.toFixed(2) : "-",
          o3Value !== null ? o3Value.toFixed(2) : "-",
        ];
      });

      const csvContent =
        [headers.join(","), ...rows.map(e => e.join(","))]
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const filename = `GasData_${selectedStationData?.nameEN.replace(/ /g, '_')}_${selectedGasType}_${new Date().toISOString().split("T")[0]}.csv`;

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด CSV");
    }
  };

  // --- RENDER COMPONENT ---

  const noDataMessage = (
    <div className="text-center p-12 bg-white rounded-xl border-dashed border-2 border-gray-300 text-gray-500 text-lg shadow-inner transition-all duration-300 hover:shadow-md">
      <FaExclamationTriangle className="text-4xl mx-auto mb-4 text-red-500" />
      <p className="font-semibold">⚠️ กรุณาเลือกภูมิภาค สถานี และวันที่ที่ต้องการดูข้อมูล</p>
      {selectedStation && filteredData.length === 0 && (
        <p className="mt-2 text-sm text-gray-400">ไม่พบข้อมูลมลพิษในช่วงเวลาที่เลือก ({viewMode})</p>
      )}
    </div>
  );
  
  // Helper to get gas-specific color
  const getGasColor = (type: GasType) => {
    switch (type) {
      case 'so2': return 'text-orange-500';
      case 'no2': return 'text-red-600';
      case 'choho': return 'text-green-600';
      default: return 'text-gray-700';
    }
  }
  
  const currentGasColor = getGasColor(selectedGasType);

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-teal-700">รายงานข้อมูลมลพิษทางอากาศ 💨</h1>

      <hr className="border-teal-100 mb-8" />
      
      {/* Selection Panel */}
      <div className="p-6 bg-white rounded-xl shadow-2xl mb-10 border border-gray-100">
        <h2 className="text-xl font-bold mb-5 text-teal-700 border-b pb-2">ตัวเลือกการแสดงผล</h2>
        
        <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
          {/* Region Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ภูมิภาค:</label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedStation('');
                setSelectedDate(null);
              }}
              className="border border-gray-300 rounded-lg p-2 mt-1 w-48 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              <option value="">-- เลือกภูมิภาค --</option>
              {locationData.map(region => (
                <option key={region.id} value={region.id}>{region.nameTH}</option>
              ))}
            </select>
          </div>

          {/* Station Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">สถานี:</label>
            <select
              value={selectedStation}
              onChange={(e) => {
                setSelectedStation(e.target.value);
                setSelectedDate(null);
              }}
              className="border border-gray-300 rounded-lg p-2 mt-1 w-64 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
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

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700">วันที่:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-lg p-2 mt-1 w-36 text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
              placeholderText="เลือกวันที่"
              disabled={!selectedStation || availableDates.length === 0}
              includeDates={availableDates}
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex gap-2">
            <span className="font-medium text-gray-700 self-center text-sm">ช่วงเวลา:</span>
            {["day", "week", "month"].map((mode) => (
              <button 
                key={mode} 
                onClick={() => setViewMode(mode as ViewMode)} 
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${viewMode === mode ? "bg-teal-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                {mode === "day" ? "รายวัน" : mode === "week" ? "รายสัปดาห์" : "รายเดือน"}
              </button>
            ))}
          </div>
        </div>

        {/* Gas Type Selection */}
        <div className="flex gap-2 items-center mt-6 pt-4 border-t">
          <span className="font-bold text-lg text-teal-700">เลือกประเภทมลพิษ:</span>
          {availableGasTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedGasType(type)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-200 shadow-sm
                ${selectedGasType === type 
                  ? `${getGasColor(type).replace('text', 'bg')} text-white shadow-lg` 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {/* Latest Data Summary */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center gap-2"><FaChartLine className="text-teal-600"/> ข้อมูลปัจจุบัน (ล่าสุด)</h2>
        
        {latestGasDataElement && selectedStationData && filteredData.length > 0 ? (
          <div className="p-6 border rounded-xl shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-white transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            {/* Station Info */}
            <div>
              <p className="text-xl font-bold text-gray-800 flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500"/> {selectedStationData.nameTH}</p>
              <p className="text-lg text-gray-600 ml-5">{selectedStationData.areaTH}</p>
              {/* LatestGes is implicitly the data for this summary, so we use its time */}
              <p className="text-sm text-gray-500 mt-2">
                อัปเดต: {latestGasDataElement.id && latestGasDataElement.id in filteredData[0] ? 
                  `${filteredData[0].day.toString().padStart(2, '0')}/${filteredData[0].month.toString().padStart(2, '0')}/${filteredData[0].year} ${filteredData[0].hours.toString().padStart(2, '0')}:00 น.`
                  : 'N/A'
                }
              </p>
            </div>
            
            {/* Main Gas Value */}
            <div className="text-center p-3 rounded-lg bg-gray-50 border-l-4 border-teal-500">
              <p className={`text-5xl font-extrabold ${currentGasColor}`}>{getGasValue(latestGasDataElement, selectedGasType)?.toFixed(2) ?? '-'}</p>
              <p className="mt-1 text-lg font-bold text-gray-700">{selectedGasType.toUpperCase()}</p>
            </div>

            {/* AOD Value */}
            <div className="text-center p-3">
              <p className="text-2xl font-bold text-gray-900">{latestGasDataElement?.aod.toFixed(2) ?? '-'}</p>
              <p className="mt-1 text-md font-semibold text-gray-600">AOD</p>
            </div>
            
            {/* O3 Value */}
            <div className="text-center p-3">
              <p className="text-2xl font-bold text-gray-900">{latestGasDataElement?.o3.toFixed(2) ?? '-'}</p>
              <p className="mt-1 text-md font-semibold text-gray-600">O3</p>
            </div>
            
          </div>
        ) : (
          noDataMessage
        )}
      </div>

      {/* Data Table */}
      <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">ตารางข้อมูลมลพิษ ({viewMode})</h2>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={!selectedStation || filteredData.length === 0}
            >
              <FaDownload /> ดาวน์โหลด CSV
            </button>
          </div>
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          {selectedStation && filteredData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 border-b-2 border-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">วัน-เวลา</th>
                  <th className={`px-6 py-3 text-left text-xs font-bold ${currentGasColor.replace('text', 'text-')} uppercase tracking-wider whitespace-nowrap`}>{selectedGasType.toUpperCase()}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">AOD</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">O3</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.map((d: Ges, idx) => {
                  const gasDataArray = d[`${selectedGasType}_id` as 'so2_id' | 'no2_id' | 'choho_id'];
                  const valueData: GasDataElementOrNull = gasDataArray[0] ?? null;
                    
                  const gasValue = getGasValue(valueData, selectedGasType);
                  const aodValue = valueData?.aod ?? null;
                  const o3Value = valueData?.o3 ?? null;

                  return (
                    <tr key={idx} className="hover:bg-teal-50 transition-colors duration-100 odd:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {d.day.toString().padStart(2, '0')}/{d.month.toString().padStart(2, '0')}/{d.year} {d.hours.toString().padStart(2, '0')}:00
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-extrabold ${currentGasColor}`}>{gasValue?.toFixed(2) ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{aodValue?.toFixed(2) ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o3Value?.toFixed(2) ?? '-'}</td>
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