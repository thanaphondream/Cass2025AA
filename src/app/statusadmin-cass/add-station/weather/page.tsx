"use client";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

// custom marker
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface Location {
  id: number;
  name_location: string;
  date: Date;
  nameTH: string;
  nameEN: string;
  number_location: string;
  description: string;
}

interface StationWeather {
  nameTH: string;
  nameEN: string;
  province: string;
  lat: number;
  long: number;
  locations_id: number;
  stationNumber: string;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface ClickableMapProps {
  setLat: React.Dispatch<React.SetStateAction<number>>;
  setLng: React.Dispatch<React.SetStateAction<number>>;
  setTempMarker: React.Dispatch<React.SetStateAction<LatLng | null>>;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  if (lat && lng) {
    map.flyTo([lat, lng], 13, { duration: 2 });
  }
  return null;
}

const ClickableMap = ({ setLat, setLng, setTempMarker }: ClickableMapProps) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLat(lat);
      setLng(lng);
      setTempMarker({ lat, lng });
    },
  });
  return null;
};

const Weather = () => {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [lat, setLat] = useState<number>(13.7563);
  const [lng, setLng] = useState<number>(100.5018);
  const [tempMarker, setTempMarker] = useState<LatLng | null>(null);
  const [search, setSearch] = useState<LatLng | null>(null);

  const [dataSave, setDataSave] = useState<StationWeather>({
    nameTH: "",
    nameEN: "",
    province: "",
    lat: 13.7563,
    long: 100.5018,
    locations_id: 0,
    stationNumber: "",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          "http://weather-cass.online:3001/api/locationget"
        );
        const data = await response.json();
        setLocationData(data.Location_find);
      } catch (err) {
        console.error("เกิดข้อผิดพลาด :", err);
      }
    };
    fetchLocations();
  }, []);

  const handleSearch = () => {
    if (lat && lng) {
      setSearch({ lat, lng });
      setTempMarker({ lat, lng });
    }
  };

  const saveStationWeather = async () => {
    if (!tempMarker) {
      alert("กรุณาวางหมุดก่อนบันทึกข้อมูล!");
      return;
    }

    try {
      const response = await fetch("http://weather-cass.online:3001/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dataSave,
          lat: tempMarker.lat,
          long: tempMarker.lng,
        }),
      });

      if (!response.ok) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

      const result = await response.json();
      console.log("บันทึกสำเร็จ:", result);
      alert("บันทึกข้อมูลเรียบร้อยแล้ว ✅");
      setTempMarker(null);
    } catch (error) {
      console.error(error);
      alert("บันทึกข้อมูลล้มเหลว ❌");
    }
  };

  return (
    <div>
      <p className="text-center text-xl font-semibold mt-6">
        เพิ่มสถานีของสภาพอากาศในแต่ละเมือง
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-36">
        <div className="mt-12 ml-14 space-y-6">
          <div>
            <label>หมายเลขสถานี</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={dataSave.stationNumber}
              onChange={(e) =>
                setDataSave({ ...dataSave, stationNumber: e.target.value })
              }
            />
          </div>

          <div>
            <label>ชื่อสถานี</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={dataSave.nameTH}
              onChange={(e) =>
                setDataSave({ ...dataSave, nameTH: e.target.value })
              }
            />
          </div>

          <div>
            <label>ชื่อภาษาอังกฤษ</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={dataSave.nameEN}
              onChange={(e) =>
                setDataSave({ ...dataSave, nameEN: e.target.value })
              }
            />
          </div>

          <div>
            <label>จังหวัด</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={dataSave.province}
              onChange={(e) =>
                setDataSave({ ...dataSave, province: e.target.value })
              }
            />
          </div>

          <div>
            <label>ภูมิภาค</label>
            <select
              className="w-full py-2 border rounded-xl"
              onChange={(e) =>
                setDataSave({
                  ...dataSave,
                  locations_id: Number(e.target.value),
                })
              }
            >
              <option value="">เลือกภูมิภาคที่ต้องการเพิ่ม</option>
              {locationData.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nameTH}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Latitude</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label>Longitude</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSearch}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl"
            >
              ค้นหาหมุด
            </button>
            <button
              type="button"
              onClick={saveStationWeather}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </div>

        {/* แผนที่ */}
        <div className="flex-1 max-w-5xl">
          <MapContainer
            center={[lat, lng]}
            zoom={6}
            style={{ height: "650px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ClickableMap
              setLat={setLat}
              setLng={setLng}
              setTempMarker={setTempMarker}
            />

            {search && (
              <>
                <Marker position={[search.lat, search.lng]} icon={customIcon}>
                  <Popup>
                    📍 {search.lat}, {search.lng}
                  </Popup>
                </Marker>
                <FlyToLocation lat={search.lat} lng={search.lng} />
              </>
            )}

            {tempMarker && !search && (
              <Marker position={[tempMarker.lat, tempMarker.lng]} icon={customIcon}>
                <Popup>
                  📍 {tempMarker.lat}, {tempMarker.lng}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Weather;
