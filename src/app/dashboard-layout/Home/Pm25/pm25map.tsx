"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaSkullCrossbones, FaFrown, FaMeh, FaSmile, FaSmileBeam } from "react-icons/fa";

interface Pollutant {
  id: number;
  color_id: number;
  aqi: number;
  value: number;
}

interface LocationData {
  id: number;
  areaTH: string;
  areaEN: string;
  nameTH: string;
  nameEN: string;
  lat: string | number;
  long: string | number;
  latestData?: {
    pm25_id?: Pollutant[];
    api?: Pollutant[];
    hours?: number;
  } | null;
}

const getPm25IconData = (value: number) => {
  let color = "#00ff00";
  let colorClass = "text-green-500";
  let icon = <FaSmileBeam />;
  let text = "ดีมาก";

  if (value >= 91) {
    color = "#ff0000";
    colorClass = "text-red-700";
    icon = <FaSkullCrossbones />;
    text = "อันตรายมาก";
  } else if (value >= 51) {
    color = "#ff6600";
    colorClass = "text-orange-600";
    icon = <FaFrown />;
    text = "คุณภาพอากาศแย่";
  } else if (value >= 38) {
    color = "#ffff00";
    colorClass = "text-yellow-500";
    icon = <FaMeh />;
    text = "ปานกลาง";
  } else if (value >= 26) {
    color = "#00cc00";
    colorClass = "text-green-600";
    icon = <FaSmile />;
    text = "ดี";
  }

  return { color, colorClass, icon, text };
};

const createCustomIcon = (color: string, value: number) =>
  new L.DivIcon({
    html: `<div style="
      background:${color};
      border-radius:50%;
      width:32px;
      height:32px;
      display:flex;
      justify-content:center;
      align-items:center;
      color:black;
      font-weight:bold;
      font-size:12px;
      box-shadow:0 0 5px rgba(0,0,0,0.5);
    ">${value}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

export default function LeafletPmMap({ locationdata }: { locationdata: LocationData[] }) {
  if (typeof window === "undefined") return null;

  return (
    <MapContainer
      center={[11.0, 100.0]}
      zoom={6}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locationdata.map((station) => {
        const pm25 = station.latestData?.pm25_id?.[0];
        if (!pm25 || pm25.value === -1) return null;

        const { color, colorClass, icon, text } = getPm25IconData(pm25.value);
        const markerIcon = createCustomIcon(color, pm25.value);

        return (
          <Marker
            key={station.id}
            position={[
              parseFloat(station.lat as string),
              parseFloat(station.long as string),
            ]}
            icon={markerIcon}
          >
            <Popup>
              <div className="space-y-2 text-sm">
                <h3 className="font-bold text-lg text-blue-700">{station.nameTH}</h3>
                <p className="text-gray-600">{station.areaTH}</p>
                <p>
                  PM2.5:{" "}
                  <span className={`font-semibold ${colorClass}`}>
                    {pm25.value} μg/m³
                  </span>
                </p>
                <p>
                  AQI: <span className="font-semibold">{pm25.aqi}</span>
                </p>
                <p>
                  {icon} {text}
                </p>
                <p className="text-gray-500 text-xs">
                   อัปเดตเวลา: {station.latestData?.hours ?? "-"}:00 น.
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
