'use client'

import React, { useState, useEffect, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import Chart from './Chart'
import { useRouter } from "next/navigation";
import { FaSmileBeam, FaSmile, FaMeh, FaFrown, FaSkullCrossbones, FaCloud, FaBolt, FaSpinner } from 'react-icons/fa'; // เพิ่ม FaSpinner


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

interface Pollutant {
    id: number;
    color_id: number;
    aqi: number;
    value: number;
}

interface LatestAQI {
    id: number;
    year: number;
    month: number;
    day: number;
    hours: number;
    createdAt: string;
    pm25_id: Pollutant[];
    pm10_id: Pollutant[];
    o3_id: Pollutant[];
    co_id: Pollutant[];
    no2_id: Pollutant[];
    so2_id: Pollutant[];
    api: Pollutant[];
}

interface NowData {
    id: number;
    areaTH: string;
    areaEN: string;
    nameTH: string;
    nameEN: string;
    stationType: string;
    stationNumber: string;
    lat: string;
    long: string;
    latest_aqi: LatestAQI[];
}

interface PM2_5 { id: number; color_id: number; aqi: number; value: number; }
interface PM10 { id: number; color_id: number; aqi: number; value: number; }
interface O3 { id: number; color_id: number; aqi: number; value: number; }
interface CO { id: number; color_id: number; aqi: number; value: number; }
interface NO2 { id: number; color_id: number; aqi: number; value: number; }
interface SO2 { id: number; color_id: number; aqi: number; value: number; }
interface API { id: number; color_id: number; aqi: number; value: number; }

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

function Page() {
    const [locationData, setLocationData] = useState<Location[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('1');
    const [selectedStation, setSelectedStation] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
    const [dataNow, setDataNow] = useState<NowData>();
    const [filteredData, setFilteredData] = useState<LastAQI_Ar4thai[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // 👈 เพิ่มสถานะ isLoading
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // 👈 เริ่มโหลด
            try {
                const rs = await fetch('https://weather-cass.online/api/V');
                const data: Location[] = await rs.json();
                setLocationData(data);

                if (data.length > 0) {
                    const defaultRegion = data.find(r => r.id.toString() === '1') || data[0];
                    setSelectedRegion(defaultRegion.id.toString());
                    if (defaultRegion.air_id.length > 0) {
                        setSelectedStation(defaultRegion.air_id[0].id.toString());
                    }
                }
            } catch (error) {
                console.error('Error fetching location data:', error);
            } finally {
                setIsLoading(false); // 👈 โหลดเสร็จสิ้น
            }
        };
        fetchData();
    }, []);

    const downloadCSV = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("กรุณาเข้าสู่ระบบก่อนดาวน์โหลด");
            router.push("/user/login");
            return;
        }

        if (!selectedStation) {
            alert("กรุณาเลือกสถานีก่อนดาวน์โหลด");
            return;
        }

        try {
            const headers = [
            "Date-Time",
            "PM2.5_id", "PM2.5_color_id", "PM2.5_aqi", "PM2.5_value",
            "PM10_id", "PM10_color_id", "PM10_aqi", "PM10_value",
            "O3_id", "O3_color_id", "O3_aqi", "O3_value",
            "CO_id", "CO_color_id", "CO_aqi", "CO_value",
            "NO2_id", "NO2_color_id", "NO2_aqi", "NO2_value",
            "SO2_id", "SO2_color_id", "SO2_aqi", "SO2_value",
            "API_id", "API_color_id", "API_aqi", "API_value"
            ];

            const rows = dataForDisplay.map(d => {
            const pm25 = d.pm25_id[0] || {};
            const pm10 = d.pm10_id[0] || {};
            const o3   = d.o3_id[0]   || {};
            const co   = d.co_id[0]   || {};
            const no2  = d.no2_id[0]  || {};
            const so2  = d.so2_id[0]  || {};
            const api  = d.api[0]     || {};

            return [
                `${d.day.toString().padStart(2, '0')}/${d.month.toString().padStart(2, '0')} ${d.hours.toString().padStart(2, '0')}:00`,

                pm25.id ?? "-", pm25.color_id ?? "-", pm25.aqi ?? "-", pm25.value ?? "-",
                pm10.id ?? "-", pm10.color_id ?? "-", pm10.aqi ?? "-", pm10.value ?? "-",
                o3.id ?? "-",   o3.color_id ?? "-",   o3.aqi ?? "-",   o3.value ?? "-",
                co.id ?? "-",   co.color_id ?? "-",   co.aqi ?? "-",   co.value ?? "-",
                no2.id ?? "-",  no2.color_id ?? "-",  no2.aqi ?? "-",  no2.value ?? "-",
                so2.id ?? "-",  so2.color_id ?? "-",  so2.aqi ?? "-",  so2.value ?? "-",
                api.id ?? "-",  api.color_id ?? "-",  api.aqi ?? "-",  api.value ?? "-"
            ];
            });

            // รวมเป็น CSV
            const csvContent =
            [headers, ...rows]
                .map(e => e.join(","))
                .join("\n");

            // สร้าง Blob สำหรับดาวน์โหลด
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            // ตั้งชื่อไฟล์
            const filename = `AQI_FullData_${selectedStation}_${new Date().toISOString().split("T")[0]}.csv`;

            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.click();
        } catch (error) {
            console.error("Error downloading CSV:", error);
            alert("เกิดข้อผิดพลาดในการดาวน์โหลด CSV");
        }
        };


    useEffect(() => {
        if (!selectedStation) {
            setDataNow(undefined);
            return;
        }

        const fetchData = async () => {
            try {
                const rs_now = await fetch(`https://weather-cass.online/api/airpm/nowdata/${Number(selectedStation)}`);
                const rs_json_now: NowData = await rs_now.json();
                setDataNow(rs_json_now);
            } catch (error) {
                console.error('Error fetching nowdata:', error);
                setDataNow(undefined);
            }
        };
        fetchData();
    }, [selectedStation]);

    const selectedStationData = useMemo(() => {
        return locationData
            .find(r => r.id.toString() === selectedRegion)
            ?.air_id.find(st => st.id.toString() === selectedStation);
    }, [locationData, selectedRegion, selectedStation]);

    useEffect(() => {
        if (selectedStationData && selectedDate) {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;
            const day = selectedDate.getDate();

            let filtered: LastAQI_Ar4thai[] = [];

            if (viewMode === "day") {
                filtered = selectedStationData.lastaqi_id.filter(
                    d => d.year === year && d.month === month && d.day === day
                );
            } else if (viewMode === "week") {
                const startDate = new Date(selectedDate);
                startDate.setDate(startDate.getDate() - 6);

                filtered = selectedStationData.lastaqi_id.filter(d => {
                    const dDate = new Date(d.year, d.month - 1, d.day);
                    dDate.setHours(0, 0, 0, 0); 

                    const compareSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    const compareStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

                    return dDate.getTime() >= compareStartDate.getTime() && dDate.getTime() <= compareSelectedDate.getTime();
                });
            } else if (viewMode === "month") {
                filtered = selectedStationData.lastaqi_id.filter(
                    d => d.year === year && d.month === month
                );
            }

            setFilteredData(filtered.sort((a, b) => {
                if (a.day !== b.day) return a.day - b.day;
                return a.hours - b.hours;
            }));
        } else {
            setFilteredData([]);
        }
    }, [selectedStationData, selectedDate, viewMode]);


    const dataForDisplay = useMemo<LastAQI_Ar4thai[]>(() => {
        const combinedData = [...filteredData];
        const latestNowData = dataNow?.latest_aqi?.[0];

        if (latestNowData && selectedDate) {
            const nowAsHistorical: LastAQI_Ar4thai = {
                id: latestNowData.id,
                year: latestNowData.year,
                month: latestNowData.month,
                day: latestNowData.day,
                hours: latestNowData.hours,
                pm25_id: latestNowData.pm25_id,
                pm10_id: latestNowData.pm10_id,
                o3_id: latestNowData.o3_id,
                co_id: latestNowData.co_id,
                no2_id: latestNowData.no2_id,
                so2_id: latestNowData.so2_id,
                api: latestNowData.api,
            };

            const isDuplicate = combinedData.some(d =>
                d.year === nowAsHistorical.year &&
                d.month === nowAsHistorical.month &&
                d.day === nowAsHistorical.day &&
                d.hours === nowAsHistorical.hours
            );

            if (!isDuplicate) {
                const isNowDataInSelectedRange = (
                    nowAsHistorical.year === selectedDate.getFullYear() &&
                    nowAsHistorical.month === selectedDate.getMonth() + 1 &&
                    (viewMode === 'month' || (viewMode === 'day' && nowAsHistorical.day === selectedDate.getDate()))
                );

                // สำหรับโหมดสัปดาห์ ต้องตรวจสอบช่วง 7 วันด้วย
                if (viewMode === 'week') {
                    const startDate = new Date(selectedDate);
                    startDate.setDate(startDate.getDate() - 6);
                    startDate.setHours(0, 0, 0, 0);

                    const nowDataTime = new Date(nowAsHistorical.year, nowAsHistorical.month - 1, nowAsHistorical.day, nowAsHistorical.hours).getTime();
                    const selectedDateEnd = new Date(selectedDate);
                    selectedDateEnd.setHours(23, 59, 59, 999);

                    if (nowDataTime >= startDate.getTime() && nowDataTime <= selectedDateEnd.getTime()) {
                        combinedData.push(nowAsHistorical);
                    }
                } else if (isNowDataInSelectedRange) {
                    combinedData.push(nowAsHistorical);
                }
            }
        }

        return combinedData.sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            return a.hours - b.hours;
        });
    }, [filteredData, dataNow, selectedDate, viewMode]);

    const Pm25_value = (pm25: number | string | undefined): React.ReactNode => {
        const val = Number(pm25);
        if (isNaN(val) || val === 0 || val === null) {
            return <div className="text-gray-500 font-semibold"><span>PM2.5: -</span></div>;
        }

        let colorClass: string;
        let icon: React.ReactNode;
        let text: string;

        if (val >= 91) {
            colorClass = "text-red-700";
            icon = <FaSkullCrossbones className="inline mr-2 text-xl" />;
            text = "อันตรายมาก";
        } else if (val >= 51) {
            colorClass = "text-orange-600";
            icon = <FaFrown className="inline mr-2 text-xl" />;
            text = "คุณภาพอากาศแย่";
        } else if (val >= 38) {
            colorClass = "text-yellow-500";
            icon = <FaMeh className="inline mr-2 text-xl" />;
            text = "ปานกลาง";
        } else if (val >= 26) {
            colorClass = "text-green-600";
            icon = <FaSmile className="inline mr-2 text-xl" />;
            text = "ดี";
        } else {
            colorClass = "text-green-500";
            icon = <FaSmileBeam className="inline mr-2 text-xl" />;
            text = "ดีมาก";
        }

        return (
            <div className={`${colorClass} font-semibold flex items-center justify-end`}>
                <span>สภาพอากาศ: {icon}{text}</span>
            </div>
        );
    };
    
    // องค์ประกอบสำหรับแสดงเมื่อไม่มีข้อมูล/กำลังโหลด
    const NoDataMessage = ({ selectedStation, isLoading }: { selectedStation: string, isLoading: boolean }) => {
        let message = "กรุณาเลือกสถานีที่ต้องการดูข้อมูล";
        let subMessage = "เลือกจากเมนู 'เลือกภูมิภาค' และ 'เลือกสถานี' ด้านบน";
        let iconDisplay: React.ReactNode;

        if (isLoading) { // 👈 แสดง Loading
             message = "กำลังโหลดข้อมูลสถานี...";
             subMessage = "โปรดรอสักครู่";
             iconDisplay = (
                 <div className="text-6xl text-blue-500 mb-4">
                     <FaSpinner className="animate-spin mx-auto" />
                 </div>
             );
        } else if (selectedStation) {
            message = "ไม่พบข้อมูลสำหรับช่วงเวลาที่เลือก";
            subMessage = `กรุณาลองเปลี่ยนวันที่หรือโหมดการแสดงผล (${viewMode})`;
            iconDisplay = (
                <div className="cloud-icon-container text-6xl">
                    <FaCloud className="text-gray-400" style={{ transform: 'scale(1.2)' }} />
                    <FaBolt className={`bolt-icon text-3xl text-red-500`} />
                </div>
            );
        } else {
             iconDisplay = (
                 <div className="cloud-icon-container text-6xl">
                     <FaCloud className="text-gray-400" style={{ transform: 'scale(1.2)' }} />
                     <FaBolt className={`bolt-icon text-3xl text-yellow-500 opacity-50`} />
                 </div>
             );
        }

        return (
            <div className="text-center p-12 bg-gray-50 rounded-lg border-dashed border-2 border-gray-300 text-gray-600 animate-fade-in">
                <style jsx global>{`
                    /* Custom Keyframes for fade-in */
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 1s ease-out;
                    }

                    /* Custom Keyframes for Cloud/Lightning Animation (kept for consistency) */
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20%, 60% { transform: translateX(-5px); }
                        40%, 80% { transform: translateX(5px); }
                    }
                    @keyframes lightning {
                        0%, 100% { opacity: 0; }
                        50% { opacity: 1; }
                    }

                    .cloud-icon-container {
                        position: relative;
                        display: inline-block;
                        margin-bottom: 1rem;
                        animation: shake 0.5s infinite alternate; 
                        animation-play-state: ${selectedStation ? 'running' : 'paused'};
                    }

                    .bolt-icon {
                        position: absolute;
                        bottom: -5px;
                        left: 50%;
                        transform: translateX(-50%);
                        animation: lightning 0.5s 0.2s infinite; 
                        animation-play-state: ${selectedStation ? 'running' : 'paused'};
                    }
                `}</style>

                {iconDisplay}

                <p className="text-xl font-bold mb-2">{message}</p>
                <p className="text-md">{subMessage}</p>
            </div>
        );
    };

    const isStationSelected = !!selectedStation;
    const hasLatestData = !!dataNow?.latest_aqi?.[0];
    const hasHistoricalData = dataForDisplay.length > 0;

    // 👈 หากกำลังโหลด ให้แสดงหน้าโหลดเต็ม
    if (isLoading) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
                 <div className="text-center p-12 bg-gray-50 rounded-lg text-gray-700">
                    <FaSpinner className="animate-spin text-6xl text-blue-500 mx-auto mb-4" />
                    <p className="text-2xl font-bold">กำลังโหลดข้อมูลสถานีทั้งหมด...</p>
                    <p className="text-lg">โปรดรอสักครู่</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            
            <p className="text-4xl font-bold mb-6 text-gray-800">
                ข้อมูลสถานีตรวจวัดคุณภาพอากาศ PM2.5 💨
            </p>
            <hr className="mb-6" />
            <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-100 rounded-lg shadow-md mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700">เลือกภูมิภาค:</label>
                    <select
                        value={selectedRegion}
                        onChange={(e) => {
                            setSelectedRegion(e.target.value);
                            setSelectedStation('');
                        }}
                        className="border border-gray-300 rounded-md p-2 mt-1"
                    >
                        {locationData.map(region => (
                            <option key={region.id} value={region.id}>
                                {region.nameTH}
                            </option>
                        ))}
                    </select>
                </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
    <label className="block text-sm font-medium text-gray-700">เลือกสถานี:</label>
    <select
        value={selectedStation}
        onChange={(e) => setSelectedStation(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-full max-w-full"
    >
        <option value="">เลือกสถานี</option>
        {locationData
            .find((r) => r.id.toString() === selectedRegion)
            ?.air_id.map((station) => (
                <option key={station.id} value={station.id}>
                    {station.nameTH}
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
                        className="border border-gray-300 rounded-md p-2 mt-1"
                        disabled={!isStationSelected}
                        includeDates={
                            selectedStationData
                                ? selectedStationData.lastaqi_id.map(
                                    d => new Date(d.year, d.month - 1, d.day)
                                )
                                : []
                        }
                        highlightDates={
                            selectedStationData
                                ? selectedStationData.lastaqi_id.map(
                                    d => new Date(d.year, d.month - 1, d.day)
                                )
                                : []
                        }
                    />
                </div>
                

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={() => setViewMode("day")}
                        className={`px-4 py-2 rounded-md ${viewMode === "day" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                        รายวัน
                    </button>
                    <button
                        onClick={() => setViewMode("week")}
                        className={`px-4 py-2 rounded-md ${viewMode === "week" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                        รายสัปดาห์
                    </button>
                    <button
                        onClick={() => setViewMode("month")}
                        className={`px-4 py-2 rounded-md ${viewMode === "month" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                        รายเดือน
                    </button>
                </div>
                
            </div>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">ข้อมูลล่าสุดของสถานี</h2>
                {hasLatestData && dataNow ? (
                    <div className="p-6 border rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white">
                        <div>
                            <p className="text-xl font-bold text-gray-800">{dataNow.nameTH ?? '-'}</p>
                            <p className="text-lg text-gray-600">{dataNow.areaTH ?? '-'}</p>
                            <p className="text-sm text-gray-500">
                                อัปเดต:
                                {dataNow.latest_aqi[0].day.toString().padStart(2, '0')}/
                                {dataNow.latest_aqi[0].month.toString().padStart(2, '0')}/
                                {dataNow.latest_aqi[0].year}
                                {dataNow.latest_aqi[0].hours.toString().padStart(2, '0')}:00 น.
                            </p>
                        </div>
                        <div className="text-center">
                            <p className={`text-6xl font-extrabold text-white rounded-full h-32 w-32 flex items-center justify-center mx-auto shadow-2xl ${
                                dataNow.latest_aqi[0].api?.[0]?.aqi <= 50 ? 'bg-green-500' :
                                dataNow.latest_aqi[0].api?.[0]?.aqi <= 100 ? 'bg-yellow-500' :
                                dataNow.latest_aqi[0].api?.[0]?.aqi <= 200 ? 'bg-orange-500' :
                                'bg-red-600'
                            }`}>
                                {dataNow.latest_aqi[0].api?.[0]?.aqi ?? "-"}
                            </p>
                            <p className="mt-2 text-xl font-semibold text-gray-700">AQI (ดัชนีคุณภาพอากาศ)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold text-blue-600">
                                {dataNow.latest_aqi[0].pm25_id?.[0]?.value ?? "-"}
                            </p>
                            <p className="text-lg font-semibold text-gray-700">PM2.5 (µg/m³)</p>
                            {Pm25_value(dataNow.latest_aqi[0].pm25_id?.[0]?.value)}
                        </div>
                    </div>
                ) : (
                    <NoDataMessage selectedStation={selectedStation} isLoading={isLoading} />
                )}
            </div>
            <hr className="my-8" />

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                    กราฟข้อมูล PM2.5 ({viewMode})
                </h2>
                <div className="border p-4 rounded-lg shadow-lg bg-white">
                    {hasHistoricalData ? (
                        <Chart filteredData={dataForDisplay} viewMode={viewMode} />
                    ) : (
                        <div className='p-8'>
                            <NoDataMessage selectedStation={selectedStation} isLoading={isLoading} />
                        </div>
                    )}
                </div>
            </div>
            

            <hr className="my-8" />

            <div className="mb-8">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={downloadCSV}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        ดาวน์โหลด CSV
                    </button>
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">ตารางข้อมูล PM2.5 ({viewMode})</h2>
                <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-lg border">
                    {hasHistoricalData ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">วัน-เวลา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">PM2.5 (µg/m³)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">PM10 (µg/m³)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">O₃ (ppb)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CO (ppm)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">NO₂ (ppb)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">SO₂ (ppb)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">AQI</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataForDisplay.map((d, idx) => (
                                    <tr key={idx} className='hover:bg-gray-50'>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {d.day.toString().padStart(2, '0')}/
                                            {d.month.toString().padStart(2, '0')}
                                            {d.hours.toString().padStart(2, '0')}:00
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{d.pm25_id[0]?.value ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.pm10_id[0]?.value ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.o3_id[0]?.value ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.co_id[0]?.value ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.no2_id[0]?.value ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.so2_id[0]?.value ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{d.api[0]?.aqi ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className='p-8'>
                            <NoDataMessage selectedStation={selectedStation} isLoading={isLoading} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Page