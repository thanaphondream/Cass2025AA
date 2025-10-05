"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading

    try {
      const res = await fetch("http://weather-cass.online:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token); 
        router.push("/statusadmin-cass/Home");
      } else {
        setError(data.message || "เข้าสู่ระบบล้มเหลว");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white p-10 rounded-3xl shadow-2xl space-y-6 transform hover:scale-[1.02] transition-transform duration-300 ease-in-out">
          
          {/* Header/Logo Placeholder */}
          <div className="text-center mb-6">
            <svg className="w-12 h-12 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            <h1 className="text-3xl font-extrabold text-gray-800 mt-2">
              เข้าสู่ระบบ
            </h1>
            <p className="text-gray-500 text-sm">จัดการข้อมูลของคุณ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Message */}
            {error && (
              <p className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium text-center">
                {error}
              </p>
            )}

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out placeholder-gray-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 rounded-xl text-white font-semibold shadow-lg transition duration-200 ease-in-out 
                ${isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 hover:shadow-xl'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  {/* Simple Loading Spinner */}
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>

        {/* Optional Footer Text */}
        <p className="mt-6 text-center text-sm text-white text-opacity-80">
          หากมีปัญหาในการเข้าสู่ระบบ โปรดติดต่อผู้ดูแลระบบ
        </p>
          <p className=" text-sm text-white text-opacity-80 text-center ">ทางอีเมล: cass2025@gmail.com</p>
      </div>
    </div>
  );
}