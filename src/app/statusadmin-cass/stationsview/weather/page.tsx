'use client'

import React, { useState, useEffect } from 'react'
import "react-datepicker/dist/react-datepicker.css";
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface hours3weather {
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
  visibility: number;
  date: Date;
}

interface Weather {
  id: number;
  nameTH: string;
  nameEN: string;
  province: string;
  lat: number;
  long: number;
  stationNumber: string;
  data3hours_weather_id: hours3weather[];
}

interface Location {
  id: number;
  name_location: string;
  date: Date;
  nameTH: string;
  nameEN: string;
  number_location: string;
  description: string;
  station_weather_id: Weather[];
}

function Page() {
  const [location_data, setLocation_data] = useState<Location[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [selectedStation, setSelectedStation] = useState<number | null>(null)
  const [Weather_data, setWeather_data] = useState<Record<string, any>>({})

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rs = await fetch("http://weather-cass.online:3001/api/weather/3hoursweather");
        const rs_json = await rs.json();

        const rs_whather = await fetch('http://weather-cass.online:3001/api/DataWhatherNow')
        const rs_json2 = await rs_whather.json();

        setWeather_data(rs_json2);
        setLocation_data(rs_json);   
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const filteredData = location_data.find(loc => loc.id === selectedRegion);
  const stationData = filteredData?.station_weather_id.find(station => station.id === selectedStation);

  const filteredWeather = stationData?.data3hours_weather_id.filter(data =>
    selectedDate &&
    data.year === selectedDate.getFullYear() &&
    data.month === selectedDate.getMonth() + 1 &&
    data.day === selectedDate.getDate()
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWeather?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = filteredWeather ? Math.ceil(filteredWeather.length / itemsPerPage) : 0;
  const handlePageChange = (page: number) => setCurrentPage(page);

  const allWeatherData = Object.values(Weather_data).flatMap((regionArray: any) =>
    regionArray.map((item: any) => ({
      ...item,
      station: item.station_weather_id,
      loc: item.station_weather_id.locations_id
    }))
  );

  const indexOfLastAllItem = currentPage * itemsPerPage;
  const indexOfFirstAllItem = indexOfLastAllItem - itemsPerPage;
  const currentAllItems = allWeatherData.slice(indexOfFirstAllItem, indexOfLastAllItem);
  const totalAllPages = Math.ceil(allWeatherData.length / itemsPerPage);

  const renderPagination = (totalPages: number, handleChange: (p: number) => void) => {
    const maxPagesToShow = 5;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="mt-4 flex justify-center gap-2">
        {pages.slice(0, maxPagesToShow).map((page) => (
          <button
            key={page}
            onClick={() => handleChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            {page}
          </button>
        ))}
        {totalPages > maxPagesToShow && (
          <button
            onClick={() => handleChange(totalPages)}
            className={`px-3 py-1 border rounded ${
              currentPage === totalPages ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {totalPages}
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">ข้อมูลสภาพอากาศจากกรมอุตุนิยมวิทยา</h1>

      <div className="flex flex-wrap justify-center gap-36 bg-gray-100 p-4 rounded-xl mx-auto">
        <div>
          <label>เลือกภูมิภาคในประเทศไทย: </label>
          <select
            className="py-2 border rounded-xl"
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              setSelectedRegion(selectedId);
              setSelectedStation(null);
              setCurrentPage(1)
            }}
          >
            <option value="">เลือกภูมิภาค</option>
            {location_data.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.nameTH}</option>
            ))}
          </select>
        </div>

        <div>
          <label>เลือกสถานีในประเทศไทย: </label>
          <select
            className="py-2 border rounded-xl "
            onChange={(e) => {
              setSelectedStation(Number(e.target.value));
              setCurrentPage(1)
            }}
            disabled={!filteredData}
          >
            <option value="">เลือกสถานี</option>
            {filteredData?.station_weather_id.map((station) => (
              <option key={station.id} value={station.id}>
                {station.nameTH} - {station.province}
              </option>
            ))}
          </select>
        </div>

        <div className="w-48 ">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              views={['year', 'month', 'day']}
              shouldDisableDate={(date) => {
                if (!stationData) return true;
                const availableDates = stationData.data3hours_weather_id.map(d =>
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
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full text-sm border-collapse text-left rtl:text-right text-shadow-gray-600">
              <thead className="bg-sky-100 sticky text-gray-600 top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left ">ภูมิภาค</th>
                  <th className="px-3 py-2 text-left">สถานี / จังหวัด</th>
                  <th className="px-3 py-2 text-left">วันที่</th>
                  <th className="px-3 py-2 text-left">เวลา</th>
                  <th className="px-3 py-2 text-left">อุณหภูมิ (°C)</th>
                  <th className="px-3 py-2 text-left">ความชื้น (%)</th>
                  <th className="px-3 py-2 text-left">SLP</th>
                  <th className="px-3 py-2 text-left">Pressure</th>
                  <th className="px-3 py-2 text-left">Dew Point</th>
                  <th className="px-3 py-2 text-left">Vapour Pressure</th>
                  <th className="px-3 py-2 text-left">ฝน 3 ชม. (mm)</th>
                  <th className="px-3 py-2 text-left">ฝน 24 ชม. (mm)</th>
                  <th className="px-3 py-2 text-left">ลม 10m (m/s)</th>
                  <th className="px-3 py-2 text-left">ทิศลม (°)</th>
                  <th className="px-3 py-2 text-left">ทัศนวิสัย (km)</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentItems.map((data) => (
                  <tr key={data.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2">{filteredData?.nameTH}</td>
                    <td className="px-3 py-2">{stationData.nameTH} - {stationData.province}</td>
                    <td className="px-3 py-2">{data.day}/{data.month}/{data.year}</td>
                    <td className="px-3 py-2">{data.hours}:00</td>
                    <td className="px-3 py-2">{data.temperaturde}</td>
                    <td className="px-3 py-2">{data.humidity}</td>
                    <td className="px-3 py-2">{data.slp}</td>
                    <td className="px-3 py-2">{data.stationPressure}</td>
                    <td className="px-3 py-2">{data.dewPoint}</td>
                    <td className="px-3 py-2">{data.vaporPressure}</td>
                    <td className="px-3 py-2">{data.rain}</td>
                    <td className="px-3 py-2">{data.rain24h}</td>
                    <td className="px-3 py-2">{data.windspeed10m}</td>
                    <td className="px-3 py-2">{data.winddirdedtion10m}</td>
                    <td className="px-3 py-2">{data.visibility}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {renderPagination(totalPages, handlePageChange)}
          </div>
        ) : (
          <p className="mt-4 text-red-500">ไม่พบข้อมูลในวันที่เลือก</p>
        )
      ) : (
        <div className="overflow-x-auto mt-6 rounded-md">
          <table className="min-w-full text-sm border-collapse text-left rtl:text-right text-shadow-gray-600">
            <thead className="bg-sky-100 sticky text-gray-600 top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left">ภูมิภาค</th>
                <th className="px-3 py-2 text-left">สถานี / จังหวัด</th>
                <th className="px-3 py-2 text-left">วันที่</th>
                <th className="px-3 py-2 text-left">เวลา</th>
                <th className="px-3 py-2 text-left">อุณหภูมิ (°C)</th>
                <th className="px-3 py-2 text-left">ความชื้น (%)</th>
                <th className="px-3 py-2 text-left">SLP (hPa)</th>
                <th className="px-3 py-2 text-left">Pressure (hPa)</th>
                <th className="px-3 py-2 text-left">Dew Point (°C)</th>
                <th className="px-3 py-2 text-left">Vapour Pressure (hPa)</th>
                <th className="px-3 py-2 text-left">ฝน 3 ชม. (mm)</th>
                <th className="px-3 py-2 text-left">ฝน 24 ชม. (mm)</th>
                <th className="px-3 py-2 text-left">ลม 10m (m/s)</th>
                <th className="px-3 py-2 text-left">ทิศลม (°)</th>
                <th className="px-3 py-2 text-left">ทัศนวิสัย (km)</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentAllItems.map((data: any) => (
                <tr key={data.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                  <td className="px-3 py-2">{data.loc.nameTH}</td>
                  <td className="px-3 py-2">{data.station.nameTH} - {data.station.province}</td>
                  <td className="px-3 py-2">{data.day}/{data.month}/{data.year}</td>
                  <td className="px-3 py-2">{data.hours}:00</td>
                  <td className="px-3 py-2">{data.temperaturde}</td>
                  <td className="px-3 py-2">{data.humidity}</td>
                  <td className="px-3 py-2">{data.slp}</td>
                  <td className="px-3 py-2">{data.stationPressure}</td>
                  <td className="px-3 py-2">{data.dewPoint}</td>
                  <td className="px-3 py-2">{data.vaporPressure}</td>
                  <td className="px-3 py-2">{data.rain}</td>
                  <td className="px-3 py-2">{data.rain24h}</td>
                  <td className="px-3 py-2">{data.windspeed10m}</td>
                  <td className="px-3 py-2">{data.winddirdedtion10m}</td>
                  <td className="px-3 py-2">{data.visibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(totalAllPages, setCurrentPage)}
        </div>
      )}
    </div>
  )
}

export default Page