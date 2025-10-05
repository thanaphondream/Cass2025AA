"use client";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
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

interface AirQualityStation {
  id?: number;
  nameTH: string;
  nameEN: string;
  areaTH: string;
  areaEN: string;
  stationType?: string | null;
  stationNumber?: string | null;
  location_id: number;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13, { duration: 2 });
    }
  }, [lat, lng, map]);

  return null;
}

const ClickableMap = ({
  setLat,
  setLng,
  setTempMarker,
}: {
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
  setTempMarker: (pos: { lat: number; lng: number } | null) => void;
}) => {
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

const Ari4thai = () => {
  const [location_data, setLocation_data] = useState<Location[]>([]);
  const [lat, setLat] = useState<number>(13.7563); // กรุงเทพเริ่มต้น
  const [lng, setLng] = useState<number>(100.5018);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [search, setSearch] = useState<{ lat: number; lng: number } | null>(null);

  const [data_save, setData_save] = useState<AirQualityStation>({
    nameTH: "",
    nameEN: "",
    areaTH: "",
    areaEN: "",
    location_id: 0,
    stationType: null,
    stationNumber: null,
  });

  useEffect(() => {
    const fn_apishow = async () => {
      try {
        const rs_data = await fetch("http://weather-cass.online:3001/api/locationget");
        const api_json = await rs_data.json();
        setLocation_data(api_json.Location_find);
      } catch (err) {
        console.error("เกิดข้อผิดพลาด : ", err);
      }
    };
    fn_apishow();
  }, []);

  const handleSearch = () => {
    if (lat && lng) {
      setSearch({ lat, lng });
      setTempMarker({ lat, lng });
    }
  };

  const dataSAVe_Station_Weather = async () => {
    if (!tempMarker) {
      alert("กรุณาวางหมุดก่อนบันทึกข้อมูล!");
      return;
    }

    try {

        console.log(data_save, tempMarker.lat, tempMarker.lng)
      const rs_save = await fetch("http://weather-cass.online:3001/api/airqualitystation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data_save,
          lat: tempMarker.lat,
          long: tempMarker.lng,
        }),
      });

      if (!rs_save.ok) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

      const result = await rs_save.json();
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
        เพิ่มสถานีของค่าฝุ่นแก็ซในแต่ละเมือง
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-36">
        {/* ฟอร์ม */}
        <div className="ml-14 space-y-6">
          <div>
            <label>รหัสสถานี</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data_save.stationNumber ?? ""}
              onChange={(e) => setData_save({ ...data_save, stationNumber: e.target.value })}
            />
          </div>

          <div>
            <label>ชื่อสถานี (ไทย)</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data_save.nameTH}
              onChange={(e) => setData_save({ ...data_save, nameTH: e.target.value })}
            />
          </div>

          <div>
            <label>ชื่อสถานี (อังกฤษ)</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data_save.nameEN}
              onChange={(e) => setData_save({ ...data_save, nameEN: e.target.value })}
            />
          </div>

          <div>
            <label>พื้นที่ (ไทย)</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data_save.areaTH}
              onChange={(e) => setData_save({ ...data_save, areaTH: e.target.value })}
            />
          </div>

          <div>
            <label>พื้นที่ (อังกฤษ)</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data_save.areaEN}
              onChange={(e) => setData_save({ ...data_save, areaEN: e.target.value })}
            />
          </div>

          <div>
            <label>ภูมิภาค</label>
            <select
              className="w-full py-2 border rounded-xl"
              value={data_save.location_id || ""}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : 0;
                setData_save({ ...data_save, location_id: value });
              }}
            >
              <option value="">เลือกภูมิภาคที่ต้องการเพิ่ม</option>
              {location_data.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nameTH}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>ประเภทสถานี</label>
            <input
              type="text"
              className="w-full py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data_save.stationType ?? ""}
              onChange={(e) => setData_save({ ...data_save, stationType: e.target.value })}
            />
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
              onClick={dataSAVe_Station_Weather}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </div>

        {/* แผนที่ */}
        <div className="flex-1 max-w-5xl">
          <MapContainer center={[lat, lng]} zoom={6} style={{ height: "900px", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ClickableMap setLat={setLat} setLng={setLng} setTempMarker={setTempMarker} />

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

export default Ari4thai;
