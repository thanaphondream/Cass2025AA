"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios"; 
import { useRouter } from "next/navigation";
import Link from "next/link"; 

interface LoginFormState {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" });
  const [error, setError] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!form.email || !form.password) {
      setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("https://weather-cass.online/api/login-user", form);
      console.log("Login Success:", res.data.message);

      localStorage.setItem("token", res.data.token);

      router.push("/");
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      
      if (axiosError.response) {
        const data = axiosError.response.data as { message?: string };
        errorMessage = data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 p-4">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6 transition duration-300 transform hover:shadow-3xl"
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          <h1 className="text-3xl font-extrabold text-gray-800 mt-2">
            เข้าสู่ระบบ
          </h1>
          <p className="text-gray-500 text-sm">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
        </div>

        {error && (
          <p className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium text-center">
            {error}
          </p>
        )}

        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              onChange={handleChange}
              value={form.email}
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 placeholder-gray-400"
            />
        </div>

        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              value={form.password}
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 placeholder-gray-400"
            />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full p-3 rounded-xl text-white font-semibold shadow-lg transition duration-200 ease-in-out flex items-center justify-center ${
            isLoading 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
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

        <p className="mt-4 text-center text-sm text-gray-600">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
            ลงทะเบียนที่นี่
          </Link>
        </p>
      </form>
    </div>
  );
}