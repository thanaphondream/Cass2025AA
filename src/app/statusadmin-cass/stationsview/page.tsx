"use client"

import React,{useState, useEffect} from "react";
import { GiDustCloud, GiModernCity } from "react-icons/gi";
import { WiDayStormShowers } from "react-icons/wi";
import { TbBuildingFactory } from "react-icons/tb";
import Link from "next/link";

const AddStation = () => {
    const [Data_length, setData_length] = useState({
        weather: 0,
        air4thi: 0,
        ges: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rs = await fetch('http://weather-cass.online:3001/api/station/length');
                const data = await rs.json();

                setData_length({
                    weather: data.weather,
                    air4thi: data.airlitystation,
                    ges: data.location_ges
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return(
        <div>
            <div>
                <p className="text-4xl font-bold">เพิ่มข้อมูลสภาพอากาศ ฝุ่นPM2.5 และ ค่าแก๊ส</p>
                <div className="flex flex-wrap justify-center gap-14 mt-20">
                    <div className="bg-blue-300  basis-110 h-52 rounded-md overflow-hidden shadow-md">
                        <Link href="stationsview/weather">
                        <div className="bg-blue-500 h-15">
                            <p className="text-white ml-4 p-3">เพิ่มข้อมูลสภาพอากาศในแต่ละเมือง</p>
                            <div className="p-4 text-white flex gap-48">
                                <WiDayStormShowers className="w-32 h-32"/>
                                <div className="text-center">
                                    <p className="text-8xl">11</p>
                                    <p>ตัวแปร</p>
                                </div>
                            </div>
                        </div>
                        </Link>
                    </div>

                    <div className="bg-amber-400  basis-110 h-52 rounded-md overflow-hidden shadow-md">
                         <Link href="stationsview/PM_Ges">
                        <div className="bg-amber-500 h-15">
                            <p className="text-white ml-4 p-3">เพิ่มข้อมูลสภาพอากาศในแต่ละเมือง</p>
                            <div className="p-4 text-white flex gap-48">
                                <GiDustCloud className="w-32 h-32"/>
                                 <div className="text-center">
                                    <p className="text-8xl">6</p>
                                    <p>ตัวแปร</p>
                                </div>
                            </div>
                        </div>
                        </Link>
                    </div>

                    <div className="bg-emerald-400  basis-110 h-52 rounded-md overflow-hidden shadow-md">
                        <div className="bg-emerald-700 h-15">
                            <p className="text-white ml-4 p-3">เพิ่มข้อมูลค่าแก็ซในแต่ละเมือง</p>
                            <div className="p-4 text-white flex gap-48">
                                <TbBuildingFactory className="w-32 h-32"/>
                                 <div className="text-center">
                                    <p className="text-8xl">3</p>
                                    <p>ตัวแปร</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddStation;