import Link from "next/link";
import { TiWeatherDownpour } from "react-icons/ti";
import { BsDatabaseFillUp } from "react-icons/bs";
import { FaUserCheck } from "react-icons/fa6";


const Home = () => {
  return (
    <div className="bg-blue-35">
     <h1 className="text-center font-bold text-3xl">ยินดีต้อนรับ</h1>
    <h1 className="text-center font-bold text-2xl text-blue-700 mt-2">
      ยินดีต้อนรับสู่ระบบติดตามสภาพอากาศ
    </h1>

    <div className="text-center mt-6 space-y-6">

      <div className="bg-blue-50 p-6 rounded-2xl shadow-md">
        <h2 className="font-semibold text-xl text-blue-600">
          📡 ข้อมูลคุณภาพอากาศจาก Air4Thai
        </h2>
        <p className="mt-2 text-gray-700">
          ระบบตรวจวัดค่าฝุ่นและแก๊สในอากาศจากสถานีทั่วประเทศ
        </p>
        <ul className="mt-3 text-left list-disc list-inside text-gray-600">
          <li>รหัสสถานีตรวจวัด (<b>stationID</b>)</li>
          <li>จังหวัด (<b>provinceName</b>)</li>
          <li>ดัชนีคุณภาพอากาศ (<b>AQI</b>)</li>
          <li>ค่าฝุ่นละออง PM2.5 และ PM10</li>
          <li>ค่าแก๊ส CO, O3, NO2, SO2</li>
          <li>เวลาที่อัปเดตล่าสุด (<b>lastUpdate</b>)</li>
        </ul>
      </div>

      <div className="bg-green-50 p-6 rounded-2xl shadow-md">
        <h2 className="font-semibold text-xl text-green-600">
          🌦️ ข้อมูลสภาพอากาศจากกรมอุตุนิยมวิทยา
        </h2>
        <p className="mt-2 text-gray-700">
          รายงานอากาศล่วงหน้าทุก 3 ชั่วโมง จากสถานีตรวจวัดทั่วประเทศ
        </p>
        <ul className="mt-3 text-left list-disc list-inside text-gray-600">
          <li>ชื่อสถานี (<b>stationNameTh</b>)</li>
          <li>จังหวัด (<b>province</b>)</li>
          <li>เวลาเก็บข้อมูล (<b>observeTime</b>)</li>
          <li>อุณหภูมิอากาศ (<b>airTemperature °C</b>)</li>
          <li>ความชื้นสัมพัทธ์ (<b>relativeHumidity %</b>)</li>
          <li>ปริมาณน้ำฝน (<b>rainfall มม.</b>)</li>
          <li>ความเร็วและทิศทางลม (<b>windSpeed, windDirection</b>)</li>
          <li>ความกดอากาศ (<b>pressure hPa</b>)</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-xl shadow-inner">
        <p className="text-yellow-800 font-medium">
          ✅ ข้อมูลจากทั้งสองแหล่ง จะช่วยให้คุณเห็นภาพรวมของ 
          <span className="font-bold">คุณภาพอากาศและสภาพอากาศ</span> 
          ในประเทศไทยได้อย่างครบถ้วนและทันเวลา
        </p>
      </div>

    </div>
      <br /><br />
      <div className="flex gap-14 p-4 flex-wrap justify-center">
      <div className="bg-rose-400 basis-110 text-center h-52 rounded-md overflow-hidden shadow-md">
        <div className="bg-rose-900 text-white h-14 flex items-center ">
          <p className="px-4 ml-2">ดูค่าอากาศ ค่าฝนและแก๊ซ ในแต่ละช่วงเวลา</p>
        </div>
      <div className="p-4 text-white">
        <TiWeatherDownpour className="w-32 h-32" />
      </div>
      </div>
      <div className="bg-fuchsia-400 basis-110 text-center h-52 rounded-md overflow-hidden shadow-md">
        <div className="bg-fuchsia-900 text-white h-14 flex items-center ">
          <p className="px-4 ml-2">เพิ่มข้อมูล ค่าอากาศ ค่าฝนและแก๊ซ</p>
        </div>
         <div className="p-4 text-white">
        <BsDatabaseFillUp className="w-32 h-32" />
      </div>
      </div>

      <div className="bg-amber-300 basis-110 text-center h-52 rounded-md overflow-hidden shadow-md">
        <div className="bg-amber-500 text-white h-14 flex items-center ">
          <p className="px-4 ml-2">ดูรายชื่อที่ล็อกอินของสามาชิก</p>
        </div>
       <div className="p-4 text-white">
            <FaUserCheck  className="w-32 h-32" />
          </div>
        </div>
      </div>

      <div className="text-center mt-20">
        <p className="text-xl font-semibold mb-2">ช่องทางการติดต่อ</p>
        
        <p className=" text-lg font-semibold">
          Facebook: 
          <a 
            href="https://web.facebook.com/cass.snru/?_rdc=1&_rdr#"
            className="ml-2 text-blue-900 underline hover:text-blue-600 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            ศูนย์วิทยาศาสตร์บรรยากาศและอวกาศ มหาวิทยาลัยราชภัฏสกลนคร
          </a>
        </p>
          <p>
            Email: cass2025@gmail.com
          </p>
          <p>
            เบอร์โทร: 088 888 8888
          </p>
      </div>

    </div>
  );
};

export default Home;
