"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface WeatherData {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  temperaturde: number;
  humidity: number;
  slp: number;
  stationPressure?: number;
  dewPoint?: number;
  vaporPressure?: number;
  rain: number;
  windspeed10m: number;
  winddirdedtion10m: number;
  date: string;
}

interface LocationData {
  id: number;
  nameTH: string;
  nameEN: string;
  province: string;
  lat: string;
  long: string;
  stationNumber?: string;
  data3hours_weather_id: WeatherData[];
}

interface LeafletMapProps {
  locationdata: LocationData[];
}

const getRainColor = (rainValue: number) => {
  if (rainValue > 50) return "#ff4d4f"; // แดง = ฝนหนัก
  if (rainValue > 20) return "#faad14"; // เหลือง = ฝนปานกลาง
  return "#52c41a"; // เขียว = ฝนเบา
};

const createCircleIcon = (color: string, temperature: number) => {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
       color:black;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
    ">
      ${temperature}°
    </div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const LeafletMap: React.FC<LeafletMapProps> = ({ locationdata }) => {
  if (!locationdata || locationdata.length === 0) {
    return <p className="text-center text-gray-500 mt-4">ไม่มีข้อมูลแสดงแผนที่</p>;
  }

  return (
    <MapContainer
      center={[11.0, 100.0]}
      zoom={6}
      style={{ height: "600px", width: "100%" }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {locationdata.map((location) => {
        if (!location.data3hours_weather_id || location.data3hours_weather_id.length === 0) return null;

        const latestData = [...location.data3hours_weather_id].sort((a, b) => {
          const dateA = new Date(`${a.date}T${String(a.hours).padStart(2, "0")}:00:00`);
          const dateB = new Date(`${b.date}T${String(b.hours).padStart(2, "0")}:00:00`);
          return dateB.getTime() - dateA.getTime();
        })[0];

        const rainColor = getRainColor(latestData.rain);
        const circleIcon = createCircleIcon(rainColor, latestData.temperaturde);

        return (
          <Marker
            key={location.id}
            position={[parseFloat(location.lat), parseFloat(location.long)]}
            icon={circleIcon}
          >
            {/* Popup ข้อมูลเมื่อคลิก */}
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-lg">{location.nameTH}</h3>
                <p> จังหวัด: {location.province}</p>
                <p> อุณหภูมิ: {latestData.temperaturde}°C</p>
                <p> ความชื้น: {latestData.humidity}%</p>
                <p> ปริมาณฝน: {latestData.rain} มม.</p>
                <p> ความเร็วลม: {latestData.windspeed10m} ม./วินาที</p>
                <p>ทิศทางลม: {latestData.winddirdedtion10m}°</p>
                <p className="text-xs text-gray-500">
                  อัปเดต: {latestData.date} เวลา {String(latestData.hours).padStart(2, "0")}:00 น.
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMap;
