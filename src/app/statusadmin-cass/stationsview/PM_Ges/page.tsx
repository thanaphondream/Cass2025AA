'use client'

import React, { useState, useEffect } from 'react'
import "react-datepicker/dist/react-datepicker.css";
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';

interface Location {
  id: number;
  name_location: string;
  date: string;
  nameTH: string;
  nameEN: string;
  number_location: string;
  description: string;
  air_id: AirQualityStation[];
}

interface AirQualityStation {
  id: number;
  areaTH: string;
  areaEN: string;
  nameTH: string;
  nameEN: string;
  stationType: string;
  stationNumber: string;
  lat: string;
  long: string;
  lastaqi_id: LastAQI_Ar4thai[];
}

interface LastAQI_Ar4thai {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  pm25_id: PM2_5[];
  pm10_id: PM10[];
  o3_id: O3[];
  co_id: CO[];
  no2_id: NO2[];
  so2_id: SO2[];
  api: API[];
}

interface PM2_5 { id: number; color_id: number; aqi: number; value: number; }
interface PM10 { id: number; color_id: number; aqi: number; value: number; }
interface O3 { id: number; color_id: number; aqi: number; value: number; }
interface CO { id: number; color_id: number; aqi: number; value: number; }
interface NO2 { id: number; color_id: number; aqi: number; value: number; }
interface SO2 { id: number; color_id: number; aqi: number; value: number; }
interface API { id: number; color_id: number; aqi: number; value: number; }

function Page() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rs = await fetch('http://weather-cass.online:3001/api/V');
        const data = await rs.json();
        setLocationData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const filteredData = locationData.find(loc => loc.id === selectedRegion);
  const stationData = filteredData?.air_id.find(station => station.id === selectedStation);

  const filteredAirQuality = stationData?.lastaqi_id.filter(data =>
    selectedDate &&
    data.year === selectedDate.getFullYear() &&
    data.month === selectedDate.getMonth() + 1 &&
    data.day === selectedDate.getDate()
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAirQuality?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = filteredAirQuality ? Math.ceil(filteredAirQuality.length / itemsPerPage) : 0;

  const allAirQualityData = locationData.flatMap(loc =>
    loc.air_id.flatMap(station => station.lastaqi_id.map(d => ({ ...d, station, loc })))
  );
  const indexOfLastAllItem = currentPage * itemsPerPage;
  const indexOfFirstAllItem = indexOfLastAllItem - itemsPerPage;
  const currentAllItems = allAirQualityData.slice(indexOfFirstAllItem, indexOfLastAllItem);
  const totalAllPages = Math.ceil(allAirQualityData.length / itemsPerPage);

  const renderPagination = (total: number) => {
    if (total <= 1) return null;

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(total, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 border rounded ${currentPage === i ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded bg-gray-200"
        >
          « หน้าแรก
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(total)}
          disabled={currentPage === total}
          className="px-3 py-1 border rounded bg-gray-200"
        >
          หน้าสุดท้าย »
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-6">ข้อมูลคุณภาพอากาศ</h1>
      <div className="flex flex-wrap justify-center gap-24 bg-gray-100 p-4 rounded-xl mx-auto">
        <div>
          <label className="block mb-1 font-medium">เลือกภูมิภาคในประเทศไทย: </label>
          <select
            className="py-2 border rounded-xl"
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              setSelectedRegion(selectedId);
              setSelectedStation(null);
              setCurrentPage(1);
            }}
          >
            <option value="">เลือกภูมิภาค</option>
            {locationData.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.nameTH}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">เลือกสถานีในประเทศไทย: </label>
          <select
            className="py-2 border rounded-xl"
            onChange={(e) => {
              setSelectedStation(Number(e.target.value));
              setCurrentPage(1);
            }}
            disabled={!filteredData}
          >
            <option value="">เลือกสถานี</option>
            {filteredData?.air_id.map((station) => (
              <option key={station.id} value={station.id}>
                {station.nameTH} - {station.areaTH}
              </option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <MobileDatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              views={['year', 'month', 'day']}
              shouldDisableDate={(date) => {
                if (!stationData) return true;
                const availableDates = stationData.lastaqi_id.map(d =>
                  new Date(d.year, d.month - 1, d.day).toDateString()
                );
                return !availableDates.includes(date.toDateString());
              }}
              slotProps={{
                textField: {
                  error: false,
                  helperText: "",
                }
              }}
            />
          </LocalizationProvider>
        </div>
      </div>

      {stationData ? (
        currentItems && currentItems.length > 0 ? (
          <div className="overflow-x-auto mt-6 rounded-md">
            <table className="min-w-full text-sm border-collapse text-left rtl:text-right text-shadow-gray-600">
              <thead className="bg-sky-100 sticky text-gray-600 top-0 z-10">
                <tr>
                  <th className="px-3 py-2">ภูมิภาค</th>
                  <th className="px-3 py-2">สถานี / จังหวัด</th>
                  <th className="px-3 py-2">วันที่</th>
                  <th className="px-3 py-2">เวลา</th>
                  <th className="px-3 py-2">PM2.5</th>
                  <th className="px-3 py-2">PM10</th>
                  <th className="px-3 py-2">O₃</th>
                  <th className="px-3 py-2">CO</th>
                  <th className="px-3 py-2">NO₂</th>
                  <th className="px-3 py-2">SO₂</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentItems.map((data) => (
                  <tr key={data.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2">{filteredData?.nameTH}</td>
                    <td className="px-3 py-2">{stationData.nameTH} - {stationData.areaTH}</td>
                    <td className="px-3 py-2">{data.day}/{data.month}/{data.year}</td>
                    <td className="px-3 py-2">{data.hours}:00</td>
                    <td className="px-3 py-2">{data.pm25_id[0]?.value ?? "-"}</td>
                    <td className="px-3 py-2">{data.pm10_id[0]?.value ?? "-"}</td>
                    <td className="px-3 py-2">{data.o3_id[0]?.value ?? "-"}</td>
                    <td className="px-3 py-2">{data.co_id[0]?.value ?? "-"}</td>
                    <td className="px-3 py-2">{data.no2_id[0]?.value ?? "-"}</td>
                    <td className="px-3 py-2">{data.so2_id[0]?.value ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-center">{renderPagination(totalPages)}</div>
          </div>
        ) : (
          <p className="mt-4 text-red-500">ไม่พบข้อมูลในวันที่เลือก</p>
        )
      ) : (
        <div className="overflow-x-auto mt-6 rounded-md">
          <table className="min-w-full text-sm border-collapse text-left rtl:text-right text-shadow-gray-600">
            <thead className="bg-sky-100 sticky text-gray-600 top-0 z-10">
              <tr>
                <th className="px-3 py-2">ภูมิภาค</th>
                <th className="px-3 py-2">สถานี / จังหวัด</th>
                <th className="px-3 py-2">วันที่</th>
                <th className="px-3 py-2">เวลา</th>
                <th className="px-3 py-2">PM2.5</th>
                <th className="px-3 py-2">PM10</th>
                <th className="px-3 py-2">O₃</th>
                <th className="px-3 py-2">CO</th>
                <th className="px-3 py-2">NO₂</th>
                <th className="px-3 py-2">SO₂</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentAllItems.map((data) => (
                <tr key={data.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                  <td className="px-3 py-2">{data.loc.nameTH}</td>
                  <td className="px-3 py-2">{data.station.nameTH} - {data.station.areaTH}</td>
                  <td className="px-3 py-2">{data.day}/{data.month}/{data.year}</td>
                  <td className="px-3 py-2">{data.hours}:00</td>
                  <td className="px-3 py-2">{data.pm25_id[0]?.value ?? "-"}</td>
                  <td className="px-3 py-2">{data.pm10_id[0]?.value ?? "-"}</td>
                  <td className="px-3 py-2">{data.o3_id[0]?.value ?? "-"}</td>
                  <td className="px-3 py-2">{data.co_id[0]?.value ?? "-"}</td>
                  <td className="px-3 py-2">{data.no2_id[0]?.value ?? "-"}</td>
                  <td className="px-3 py-2">{data.so2_id[0]?.value ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center">{renderPagination(totalAllPages)}</div>
        </div>
      )}
    </div>
  )
}

export default Page
