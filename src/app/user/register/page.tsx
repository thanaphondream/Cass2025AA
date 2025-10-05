"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaUser } from "react-icons/fa";

interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  purpose: string;
  workplace: string;
  phone: string;
}

type RegisterStep = "REGISTER" | "VERIFY_OTP";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    purpose: "",
    workplace: "",
    phone: "",
  });

  const [step, setStep] = useState<RegisterStep>("REGISTER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [passwordError, setPasswordError] = useState<string>(""); 
  const [showPassword, setShowPassword] = useState(false); 

  const [otpTimer, setOtpTimer] = useState(0);
  const RESEND_TIMEOUT = 60;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const checkPassword = (password: string): boolean => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("ต้องมีอย่างน้อย 8 ตัวอักษร");
    if (!/[A-Z]/.test(password)) errors.push("ต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z)");
    if (!/[a-z]/.test(password)) errors.push("ต้องมีตัวอักษรพิมพ์เล็ก (a-z)");
    if (!/\d/.test(password)) errors.push("ต้องมีตัวเลข (0-9)");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("ต้องมีอักขระพิเศษ (!@#$%^&*)");

    if (errors.length > 0) {
      setPasswordError(errors.join(" | ")); 
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
      checkPassword(value);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPassword(form.password)) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ถูกต้อง",
        html: `<div style="text-align: left; padding: 10px; color: #d33;">เงื่อนไขรหัสผ่านไม่ครบถ้วน: ${passwordError}</div>`,
        confirmButtonText: "รับทราบ"
      });
      return;
    }
    
    if (!form.email || !form.username || !form.phone || !form.password || !form.confirmPassword) {
      Swal.fire("ข้อมูลไม่ครบ!", "กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "warning");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Swal.fire("รหัสผ่านไม่ตรงกัน!", "โปรดกรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน", "error");
      return;
    }
    
    setLoading(true);

    try {
      const resCheck = await fetch(`http://weather-cass.online:3001/api/check-emil/${form.email}`);
      const checkData = await resCheck.json();

      if (checkData.Data !== true) {
        Swal.fire("อีเมลซ้ำ!", "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น", "error");
        setLoading(false);
        return;
      }

      const otp = generateOTP();
      setServerOtp(otp);

      const emailRes = await fetch("http://weather-cass.online:3001/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.email,
          subject: "รหัสยืนยัน OTP สำหรับการสมัครสมาชิก",
          text: `${otp}`,
        }),
      });

      const emailData = await emailRes.json();
      if (!emailRes.ok) throw new Error(emailData.message || "ส่งอีเมล OTP ล้มเหลว");

      setOtpTimer(RESEND_TIMEOUT);
      setStep("VERIFY_OTP");

      Swal.fire("ส่งรหัส OTP สำเร็จ", `โปรดตรวจสอบอีเมล (${form.email}) เพื่อกรอกรหัสยืนยัน`, "success");
    } catch (err: any) {
      Swal.fire("ผิดพลาด!", err.message || "เกิดข้อผิดพลาดในการส่ง OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (otpCode !== serverOtp) {
      Swal.fire("OTP ไม่ถูกต้อง!", "กรุณากรอกรหัส OTP ที่ถูกต้อง", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://weather-cass.online:3001/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password, 
          purpose: form.purpose,
          workplace: form.workplace,
          phone: form.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "สมัครสมาชิกไม่สำเร็จ");

      await Swal.fire("สำเร็จ!", "สมัครสมาชิกเรียบร้อยแล้ว", "success");
      router.push("/user/login");
    } catch (err: any) {
      Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (name: keyof RegisterFormState, placeholder: string) => (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        value={form[name]}
        required
        minLength={8}
        className={`w-full border p-3 rounded-xl pr-10 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${name === 'password' && passwordError ? 'border-red-500' : 'border-gray-300'}`}
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600 transition duration-150"
      >
        {showPassword ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.974 9.974 0 011.563-3.649m6.416 3.018A3 3 0 0112 11a3 3 0 01.32.019m5.651 2.378A10.027 10.027 0 0121 12c-1.275-4.057-5.065-7-9.543-7a9.974 9.974 0 00-1.563.649m-6.416 3.018A3 3 0 0112 11a3 3 0 01.32.019" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );

  const renderForm = () => {
    if (step === "VERIFY_OTP") {
      const isTimerActive = otpTimer > 0;
      const buttonText = isTimerActive ? `ส่งใหม่ใน ${otpTimer} วินาที` : "ส่งรหัส OTP ใหม่";

      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-indigo-700">ยืนยันรหัส OTP </h2>
          <p className="text-center text-gray-600 text-sm">
            เราได้ส่งรหัส 6 หลักไปยังอีเมล <span className="font-semibold text-indigo-600">{form.email}</span>
            <br/>โปรดตรวจสอบกล่องข้อความ (และ Junk Mail)
          </p>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <input
              type="text"
              name="otpCode"
              placeholder="กรอกรหัส 6 หลัก"
              onChange={handleOtpChange}
              value={otpCode}
              maxLength={6}
              required
              inputMode="numeric"
              className="border border-gray-300 p-4 rounded-xl text-center text-xl tracking-widest font-mono focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className={`w-full p-3 rounded-xl text-white font-bold shadow-lg transition duration-200 ${
                loading || otpCode.length !== 6 ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "กำลังยืนยัน..." : "ยืนยันการสมัครสมาชิก"}
            </button>

            <button
              type="button"
              onClick={handleRegisterSubmit}
              disabled={isTimerActive || loading}
              className={`text-sm font-medium p-2 rounded-lg transition duration-150 ${
                isTimerActive ? "text-gray-500 cursor-not-allowed bg-gray-100" : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
              }`}
            >
              {buttonText}
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-6 ">
        <div className="flex justify-center">
            <FaUser className="text-5xl text-indigo-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-indigo-700">ลงทะเบียนบัญชีใหม่</h1>
        <p className="text-center text-gray-500 text-sm">กรอกข้อมูลที่จำเป็น (*) เพื่อรับรหัสยืนยัน OTP</p>
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="username" placeholder="ชื่อผู้ใช้ *" onChange={handleChange} value={form.username} required className="border p-3 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
            <input name="phone" placeholder="เบอร์โทรศัพท์ *" onChange={handleChange} value={form.phone} required className="border p-3 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
            <input name="email" type="email" placeholder="อีเมล *" onChange={handleChange} value={form.email} required className="border p-3 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
            
            {renderPasswordInput("password", "รหัสผ่าน *")}
            {renderPasswordInput("confirmPassword", "ยืนยันรหัสผ่าน *")}
          </div>
          
          {passwordError ? (
              <p className="text-red-500 text-xs -mt-2 text-left">
                  ❌ รหัสผ่านไม่สมบูรณ์: {passwordError}
              </p>
          ) : (
              <p className="text-xs text-gray-500 -mt-2 text-left">
                  รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, พิมพ์ใหญ่, พิมพ์เล็ก, ตัวเลข, และอักขระพิเศษ
              </p>
          )}

          <input name="workplace" placeholder="หน่วยงาน/ที่ทำงาน (ไม่บังคับ)" onChange={handleChange} value={form.workplace} className="border p-3 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
          <input name="purpose" placeholder="จุดประสงค์ (ไม่บังคับ)" onChange={handleChange} value={form.purpose} className="border p-3 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />

          <button type="submit" disabled={loading || !!passwordError} className={`w-full p-3 rounded-xl text-white font-bold shadow-lg transition duration-200 ${loading || !!passwordError ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
            {loading ? "กำลังดำเนินการ..." : "สมัครสมาชิกและรับรหัส OTP"}
          </button>

          <p className="mt-2 text-center text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/user/login" className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </form>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4 ">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100">
        {renderForm()}
      </div>
    </div>
  );
}