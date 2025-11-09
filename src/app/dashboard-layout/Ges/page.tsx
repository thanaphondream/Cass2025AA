'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { FaDownload, FaSmog, FaExclamationTriangle, FaCalendarAlt, FaGasPump } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";


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
  date: Date; // Pre-processed Date object
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
type GasType = 'so2' | 'no2' | 'choho';

const availableGasTypes: GasType[] = ["so2", "no2", "choho"];

type GasDataElement = So2 | No2 | Choho;
type GasDataElementOrNull = GasDataElement | null;

// -------------------------------------------------------------
// HELPER FUNCTION: Type-safe lookup for dynamic gas property
// -------------------------------------------------------------
/**
 * Lookup the main gas value (so2, no2, or choho) from the specific gas object.
 * @param data The specific gas object (So2, No2, or Choho).
 * @param type The selected gas type ('so2', 'no2', or 'choho').
 * @returns The gas concentration value (number) or null if not found.
 */
function getGasValue(data: GasDataElementOrNull, type: GasType): number | null {
    if (!data) return null;
    
    // Type checking is now redundant due to the strict 'type' parameter matching
    // the interfaces, but we keep the safety check just in case.
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
  const [selectedGasType, setSelectedGasType] = useState<GasType>('so2');
  const [filteredData, setFilteredData] = useState<Ges[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rs = await fetch("http://localhost:3001/api/ShowData");
        const rawData: unknown = await rs.json();
        
        if (!Array.isArray(rawData)) {
            console.error("Fetched data is not an array.");
            return;
        }

        // Process data to convert date fields into a proper Date object
        const processedData: Location[] = rawData.map((loc: Location) => ({
          ...loc,
          locationges_id: loc.locationges_id.map((locGes: LocationGes) => ({
            ...locGes,
            ges_id: locGes.ges_id.map((gesData: Ges) => ({
              ...gesData,
              // Convert to Date object for easier filtering later
              date: new Date(gesData.year, gesData.month - 1, gesData.day, gesData.hours)
            }))
          }))
        }));

        setLocationData(processedData);

        if (processedData.length > 0) {
          const defaultRegion = processedData[0];
          setSelectedRegion(defaultRegion.id.toString());
          
          if (defaultRegion.locationges_id.length > 0) {
            const defaultStation = defaultRegion.locationges_id[0];
            setSelectedStation(defaultStation.id.toString());
            
            // Set latest available date as default
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

  // --- MEMOIZED DATA SELECTORS ---

  // Get the currently selected station's data
  const selectedStationData = useMemo(() => {
    return locationData
      .find(r => r.id.toString() === selectedRegion)
      ?.locationges_id.find(st => st.id.toString() === selectedStation) ?? null;
  }, [locationData, selectedRegion, selectedStation]);

  // Get the latest single data point for the current station
  const latestGesData = useMemo(() => {
    if (!selectedStationData || selectedStationData.ges_id.length === 0) return null;
    const sorted = [...selectedStationData.ges_id].sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted[0];
  }, [selectedStationData]);

  // Get the specific GasDataElement for the latest data point based on selectedGasType
  const latestGasDataElement = useMemo(() => {
      if (!latestGesData) return null;

      let key: 'so2_id' | 'no2_id' | 'choho_id';
      if (selectedGasType === 'so2') key = 'so2_id';
      else if (selectedGasType === 'no2') key = 'no2_id';
      else key = 'choho_id';

      // Check if the array exists and has at least one element
      return latestGesData[key]?.length > 0 ? latestGesData[key][0] as GasDataElement : null;
  }, [latestGesData, selectedGasType]);


  // Get the list of unique dates with data for the DatePicker
  const availableDates = useMemo(() => {
    if (!selectedStationData) return [];
    
    // Create a Set of date timestamps (YYYY-MM-DD) for uniqueness
    const dateTimestamps = new Set(selectedStationData.ges_id.map(
      d => new Date(d.year, d.month - 1, d.day).getTime()
    ));
    
    // Convert timestamps back to Date objects
    return Array.from(dateTimestamps).map(t => new Date(t));
  }, [selectedStationData]);

  // --- FILTERING LOGIC (Main Effect) ---
  useEffect(() => {
    if (selectedStationData && selectedDate) {
      const allStationData = selectedStationData.ges_id;

      let filtered: Ges[] = [];
      const selectedTime = selectedDate.getTime();

      if (viewMode === "day") {
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1; // End of the selected day

        filtered = allStationData.filter(d => {
            const dTime = d.date.getTime();
            return dTime >= dayStart && dTime <= dayEnd;
        });

      } else if (viewMode === "week") {
        // Find the start of the week (7 days leading up to and including selectedDate)
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        filtered = allStationData.filter(d => {
          return d.date.getTime() >= startDate.getTime() && d.date.getTime() <= endDate.getTime();
        });
        
      } else if (viewMode === "month") {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1; // 1-indexed

        filtered = allStationData.filter(
          d => d.year === year && d.month === month
        );
      }

      // Sort by date/time ascending
      setFilteredData(filtered.sort((a, b) => a.date.getTime() - b.date.getTime()));
    } else {
      setFilteredData([]);
    }
  }, [selectedStationData, selectedDate, viewMode]);

  // --- HANDLERS ---
  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedStation(''); // Reset station
    setSelectedDate(null); // Reset date
    
    const newRegion = locationData.find(r => r.id.toString() === regionId);
    if (newRegion && newRegion.locationges_id.length > 0) {
        // Automatically select the first station in the new region
        const defaultStationId = newRegion.locationges_id[0].id.toString();
        setSelectedStation(defaultStationId);

        // Find and set the latest date for the newly selected station
        const defaultStation = newRegion.locationges_id[0];
        const latestDate = defaultStation.ges_id
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.date || null;
        setSelectedDate(latestDate);
    }
  };

  const handleStationChange = (stationId: string) => {
    setSelectedStation(stationId);
    setSelectedDate(null); // Reset date

    // Find and set the latest date for the newly selected station
    const station = locationData.find(r => r.id.toString() === selectedRegion)
        ?.locationges_id.find(st => st.id.toString() === stationId);

    const latestDate = station?.ges_id
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.date || null;
    
    setSelectedDate(latestDate);
  };


  // --- DOWNLOAD CSV ---
  const downloadCSV = useCallback(() => {
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
        // Get the specific gas data object for this hourly reading
        const valueData: GasDataElementOrNull = 
          selectedGasType === "so2" ? d.so2_id[0] ?? null :
          selectedGasType === "no2" ? d.no2_id[0] ?? null : 
          d.choho_id[0] ?? null;

        // Use the type-safe helper function for the gas concentration
        const gasValue = getGasValue(valueData, selectedGasType);

        // Safely access AOD and O3, which are on the BaseGas interface
        const aodValue = valueData?.aod ?? null;
        const o3Value = valueData?.o3 ?? null;

        // Format the date/time string
        const dateTimeStr = `${d.day.toString().padStart(2, '0')}/${d.month.toString().padStart(2, '0')}/${d.year} ${d.hours.toString().padStart(2, '0')}:00`;

        return [
          dateTimeStr,
          gasValue !== null ? gasValue.toFixed(2) : "-",
          aodValue !== null ? aodValue.toFixed(2) : "-",
          o3Value !== null ? o3Value.toFixed(2) : "-",
        ];
      });

      const csvContent =
        [headers, ...rows]
          .map(e => e.join(","))
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const filename = `GasData_${selectedStationData?.nameEN.replace(/\s/g, '_') ?? 'Station'}_${selectedGasType}_${new Date().toISOString().split("T")[0]}.csv`;

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
  }, [selectedStation, filteredData, selectedGasType, router, selectedStationData]);

  const NoDataMessage = (
    <div className="text-center p-12 bg-gray-50 rounded-lg border-dashed border-2 border-gray-300 text-gray-500 text-lg">
      <FaExclamationTriangle className="text-4xl mx-auto mb-4 text-red-500" />
      <p>⚠️ กรุณาเลือกภูมิภาค สถานี และวันที่ที่ต้องการดูข้อมูล</p>
      {selectedStation && filteredData.length === 0 && (
        <p className="mt-2 text-sm text-red-400">ไม่พบข้อมูลมลพิษในช่วงเวลาที่เลือก ({viewMode})</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 flex items-center gap-2">
        <FaGasPump className="text-red-600"/> ข้อมูลมลพิษทางอากาศ
      </h1>
      <hr className="mb-8 border-gray-200" />

      {/* --- CONTROL PANEL --- */}
      <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg mb-10 flex flex-wrap gap-4 items-end">
        
        {/* Region Select */}
        <div className='w-full sm:w-48'>
          <label className="block text-sm font-medium text-gray-700">เลือกภูมิภาค:</label>
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 mt-1 w-full bg-white shadow-sm focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">-- เลือกภูมิภาค --</option>
            {locationData.map(region => (
              <option key={region.id} value={region.id}>{region.nameTH}</option>
            ))}
          </select>
        </div>

        {/* Station Select */}
        <div className='w-full sm:w-48'>
          <label className="block text-sm font-medium text-gray-700">เลือกสถานี:</label>
          <select
            value={selectedStation}
            onChange={(e) => handleStationChange(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 mt-1 w-full bg-white shadow-sm focus:ring-amber-500 focus:border-amber-500"
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
        <div className='w-full sm:w-40'>
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <FaCalendarAlt className="text-xs text-gray-400"/> เลือกวันที่:
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 rounded-lg p-2 mt-1 w-full bg-white shadow-sm focus:ring-amber-500 focus:border-amber-500 text-center"
            placeholderText="เลือกวันที่"
            disabled={!selectedStation || availableDates.length === 0}
            includeDates={availableDates}
            highlightDates={availableDates}
          />
        </div>

        {/* View Mode Buttons */}
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <span className="text-sm font-medium text-gray-700 self-center hidden sm:block">โหมด:</span>
          {(["day", "week", "month"] as ViewMode[]).map(mode => (
            <button 
                key={mode} 
                onClick={() => setViewMode(mode)} 
                className={`px-3 py-2 text-sm rounded-lg font-semibold transition duration-150 ${viewMode === mode ? "bg-amber-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
                {mode === "day" ? "รายวัน" : mode === "week" ? "รายสัปดาห์" : "รายเดือน"}
            </button>
          ))}
        </div>
        
        {/* Gas Type Buttons */}
        <div className="flex gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0">
          <span className="text-sm font-medium text-gray-700">ประเภทมลพิษ:</span>
          {availableGasTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedGasType(type)}
              className={`px-3 py-2 text-sm rounded-lg font-bold transition duration-150 ${selectedGasType === type ? "bg-indigo-600 text-white shadow-md" : "bg-red-50 text-indigo-600 border border-red-200 hover:bg-red-100"}`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

      </div>

      {/* --- CURRENT DATA SNAPSHOT --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">ข้อมูลปัจจุบัน (ล่าสุด)</h2>
        {latestGasDataElement && selectedStationData && latestGesData ? (
          <div className="p-6 border rounded-xl shadow-2xl bg-white grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            
            {/* Station Info */}
            <div>
              <p className="text-2xl font-bold text-gray-800">{selectedStationData.nameTH}</p>
              <p className="text-lg text-gray-600">{selectedStationData.areaTH}</p>
              <p className="text-sm text-gray-500 mt-2">
                อัปเดต: {latestGesData.day.toString().padStart(2, '0')}/{latestGesData.month.toString().padStart(2, '0')}/{latestGesData.year} {latestGesData.hours.toString().padStart(2, '0')}:00 น.
              </p>
            </div>
            
            {/* Main Gas Value */}
            <div className="text-center p-3 border-l-2 border-r-2 border-amber-100">
              <FaSmog className="text-5xl text-amber-500 mx-auto mb-2" />
              <p className="text-5xl font-extrabold text-amber-600">{getGasValue(latestGasDataElement, selectedGasType)?.toFixed(2) ?? '-'}</p>
              <p className="mt-1 text-xl font-bold text-gray-700">{selectedGasType.toUpperCase()}</p>
            </div>

            {/* AOD Value */}
            <div className="text-center p-3 border-r-2 border-amber-100">
              <p className="text-2xl font-extrabold text-gray-800">{latestGasDataElement.aod?.toFixed(2) ?? '-'}</p>
              <p className="mt-1 text-md font-semibold text-gray-600">AOD</p>
            </div>

            {/* O3 Value */}
            <div className="text-center p-3">
              <p className="text-2xl font-extrabold text-gray-800">{latestGasDataElement.o3?.toFixed(2) ?? '-'}</p>
              <p className="mt-1 text-md font-semibold text-gray-600">O3</p>
            </div>

          </div>
        ) : (
          NoDataMessage
        )}
      </section>

      {/* --- DATA TABLE --- */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700">ตารางข้อมูลมลพิษ (แสดงข้อมูล {viewMode === "day" ? "รายชั่วโมง" : viewMode === "week" ? "รายสัปดาห์" : "รายเดือน"})</h2>
          
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!selectedStation || filteredData.length === 0}
          >
            <FaDownload /> ดาวน์โหลด CSV
          </button>
        </div>
        
        <div className="overflow-x-auto bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
          {selectedStation && filteredData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">วัน-เวลา (D/M H:00)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{selectedGasType.toUpperCase()}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">AOD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">O3</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.map((d: Ges, idx) => {
                  
                  // Get the specific gas data object
                  const valueData: GasDataElementOrNull = selectedGasType === "so2"
                      ? d.so2_id[0] ?? null
                      : selectedGasType === "no2"
                      ? d.no2_id[0] ?? null
                      : d.choho_id[0] ?? null;
                      
                  // Get values using the type-safe function or optional chaining
                  const gasValue = getGasValue(valueData, selectedGasType);
                  const aodValue = valueData?.aod ?? null;
                  const o3Value = valueData?.o3 ?? null;

                  // Date/Time formatting
                  const formattedDateTime = `${d.day.toString().padStart(2, '0')}/${d.month.toString().padStart(2, '0')} ${d.hours.toString().padStart(2, '0')}:00`;

                  return (
                    <tr key={idx} className="hover:bg-yellow-50 transition duration-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{formattedDateTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-600">{gasValue?.toFixed(2) ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{aodValue?.toFixed(2) ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{o3Value?.toFixed(2) ?? '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            NoDataMessage
          )}
        </div>
      </section>
    </div>
  );
}

export default GasDataPage;