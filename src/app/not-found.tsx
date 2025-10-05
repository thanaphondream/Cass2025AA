import { NextPage } from "next";
import Link from "next/link"; // ✅ เพิ่มการ import Link

const Custom404: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <h1 className="text-9xl font-bold text-cyan-50 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6 text-white">หน้าไม่พบ!</h2>
      <p className="text-blue-50">คุณกำลังหลงทางอยู่ใช่ไหม?</p>
      
      {/* ✅ ใช้ Link แทน a */}
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-amber-600 rounded-lg hover:bg-amber-700 transition"
      >
        กลับไปหน้าหลัก
      </Link>
    </div>
  );
};

export default Custom404;
