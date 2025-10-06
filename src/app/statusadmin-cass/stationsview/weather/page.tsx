'use client'

import React, { useState, useEffect } from 'react'
import { ReactNode } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Hours3Weather {
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
  locations_id?: Location;
  data3hours_weather_id: Hours3Weather[];
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

interface WeatherResponse {
  [key: string]: Location[];
}

function Page() {
  const [location_data, setLocation_data] = useState<Location[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [selectedStation, setSelectedStation] = useState<number | null>(null)
  const [Weather_data, setWeather_data] = useState<WeatherResponse>({})

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rs = await fetch("http://weather-cass.online:3001/api/weather/3hoursweather");
        const rs_json: Location[] = await rs.json();

        const rs_weather = await fetch("http://weather-cass.online:3001/api/DataWhatherNow");
        const rs_json2: WeatherResponse = await rs_weather.json();

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
  const currentItems = filteredWeather?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = filteredWeather ? Math.ceil(filteredWeather.length / itemsPerPage) : 0;

  const handlePageChange = (page: number) => setCurrentPage(page);

  const allWeatherData = Object.values(Weather_data).flatMap((regionArray) =>
    regionArray.flatMap((loc) =>
      loc.station_weather_id.flatMap((station) =>
        station.data3hours_weather_id.map((item) => ({
          ...item,
          station,
          loc,
        }))
      )
    )
  );

  const indexOfLastAllItem = currentPage * itemsPerPage;
  const indexOfFirstAllItem = indexOfLastAllItem - itemsPerPage;
  const currentAllItems = allWeatherData.slice(indexOfFirstAllItem, indexOfLastAllItem);
  const totalAllPages = Math.ceil(allWeatherData.length / itemsPerPage);

  const renderPagination = (
    totalPages: number,
    handleChange: (page: number) => void
  ) => {
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

      {/* ส่วนเลือกภูมิภาคและสถานี */}
      <div className="flex flex-wrap justify-center gap-36 bg-gray-100 p-4 rounded-xl mx-auto">
        <div>
          <label>เลือกภูมิภาคในประเทศไทย: </label>
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
            {location_data.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.nameTH}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>เลือกสถานีในประเทศไทย: </label>
          <select
            className="py-2 border rounded-xl "
            onChange={(e) => {
              setSelectedStation(Number(e.target.value));
              setCurrentPage(1);
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
              views={["year", "month", "day"]}
              shouldDisableDate={(date) => {
                if (!stationData) return true;
                const availableDates = stationData.data3hours_weather_id.map((d) =>
                  new Date(d.year, d.month - 1, d.day).toDateString()
                );
                return !availableDates.includes(date.toDateString());
              }}
              slotProps={{
                textField: { error: false, helperText: "" },
              }}
            />
          </LocalizationProvider>
        </div>
      </div>

      {/* ตารางข้อมูล */}
      {stationData ? (
        currentItems.length > 0 ? (
          <WeatherTable
            data={currentItems}
            regionName={filteredData?.nameTH ?? ""}
            stationName={stationData.nameTH}
            province={stationData.province}
            renderPagination={renderPagination}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        ) : (
          <p className="mt-4 text-red-500">ไม่พบข้อมูลในวันที่เลือก</p>
        )
      ) : (
        <WeatherTable
          data={currentAllItems}
          renderPagination={renderPagination}
          totalPages={totalAllPages}
          handlePageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

interface WeatherTableProps {
  data: (Hours3Weather & { station?: Weather; loc?: Location })[];
  regionName?: string;
  stationName?: string;
  province?: string;
  renderPagination: (totalPages: number, handleChange: (page: number) => void) => ReactNode;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const WeatherTable: React.FC<WeatherTableProps> = ({
  data,
  regionName,
  stationName,
  province,
  renderPagination,
  totalPages,
  handlePageChange,
}) => (
  <div className="overflow-x-auto mt-6">
    <table className="min-w-full text-sm border-collapse text-left text-shadow-gray-600">
      <thead className="bg-sky-100 text-gray-600">
        <tr>
          <th className="px-3 py-2">ภูมิภาค</th>
          <th className="px-3 py-2">สถานี / จังหวัด</th>
          <th className="px-3 py-2">วันที่</th>
          <th className="px-3 py-2">เวลา</th>
          <th className="px-3 py-2">อุณหภูมิ (°C)</th>
          <th className="px-3 py-2">ความชื้น (%)</th>
          <th className="px-3 py-2">SLP</th>
          <th className="px-3 py-2">Pressure</th>
          <th className="px-3 py-2">Dew Point</th>
          <th className="px-3 py-2">Vapour Pressure</th>
          <th className="px-3 py-2">ฝน 3 ชม. (mm)</th>
          <th className="px-3 py-2">ฝน 24 ชม. (mm)</th>
          <th className="px-3 py-2">ลม 10m (m/s)</th>
          <th className="px-3 py-2">ทิศลม (°)</th>
          <th className="px-3 py-2">ทัศนวิสัย (km)</th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {data.map((row) => (
          <tr key={row.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
            <td className="px-3 py-2">{regionName ?? row.loc?.nameTH}</td>
            <td className="px-3 py-2">{stationName ?? row.station?.nameTH} - {province ?? row.station?.province}</td>
            <td className="px-3 py-2">{row.day}/{row.month}/{row.year}</td>
            <td className="px-3 py-2">{row.hours}:00</td>
            <td className="px-3 py-2">{row.temperaturde}</td>
            <td className="px-3 py-2">{row.humidity}</td>
            <td className="px-3 py-2">{row.slp}</td>
            <td className="px-3 py-2">{row.stationPressure}</td>
            <td className="px-3 py-2">{row.dewPoint}</td>
            <td className="px-3 py-2">{row.vaporPressure}</td>
            <td className="px-3 py-2">{row.rain}</td>
            <td className="px-3 py-2">{row.rain24h}</td>
            <td className="px-3 py-2">{row.windspeed10m}</td>
            <td className="px-3 py-2">{row.winddirdedtion10m}</td>
            <td className="px-3 py-2">{row.visibility}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {renderPagination(totalPages, handlePageChange)}
  </div>
);

export default Page;
