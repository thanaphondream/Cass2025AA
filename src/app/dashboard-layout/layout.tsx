"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { FaBars, FaCaretDown, FaUser } from "react-icons/fa";

interface ProfileData {
  id: string;
  email: string;
  name?: string;
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [status_Tap, set_Status_Tap] = useState(true);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showGasSubMenu, setShowGasSubMenu] = useState(false);
  const [boolean_token, setBoolean_Token] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setBoolean_Token(!!token);
    if (token) {
      fetchProfile(token);
    }
  }, []);

  useEffect(() => {
    if (
      pathname === "/dashboard-layout/Download" ||
      pathname === "/dashboard-layout/pm25" ||
      pathname.startsWith("/dashboard-layout/Ges/")
    ) {
      setShowSubMenu(true);
      setShowGasSubMenu(pathname.startsWith("/dashboard-layout/Ges/"));
    } else {
      setShowSubMenu(false);
      setShowGasSubMenu(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setBoolean_Token(false);
    setProfileData(null);
    router.push("/user/login");
  };

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch("https://weather-cass.online/api/decode-token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setProfileData(data.payload);
    } catch (error) {
      // console.error("เกิดข้อผิดพลาด:", error);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 shadow">
        <div className="flex items-center space-x-3">
          <button
            className="text-xl"
            onClick={() => set_Status_Tap((prev) => !prev)}
          >
            &#9776;
          </button>
          <span className="font-bold text-lg">ระบบจัดการบ้าน</span>
        </div>

        <div className="flex items-center space-x-4 relative">
          {boolean_token && profileData ? (
            <div className="flex items-center space-x-2 cursor-pointer relative">
              <div
                className="flex items-center space-x-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FaUser className="text-xl text-indigo-400" />
                <span className="hidden sm:inline">โปรไฟล์</span>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-12 w-52 bg-white text-gray-800 rounded-xl shadow-2xl z-50">
                  <div
                    className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl"
                    onClick={() => setShowProfileMenu(prev => !prev)}
                  >
                    <p className="font-semibold text-sm truncate">{profileData?.email || "ไม่พบอีเมล"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {profileData?.name || "ไม่พบ ID"}</p>
                  </div>
                  <button
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700 rounded-b-xl"
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/user/login")}
              className="text-sm hover:text-green-400"
            >
              ⏻ Login
            </button>
          )}
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {status_Tap && (
          <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <nav className="flex-1 overflow-y-auto">
              <ul>
                <li>
                  <Link
                    href="/dashboard-layout/Home"
                    className={`flex items-center p-2 hover:bg-gray-700 ${
                      pathname === "/dashboard-layout/Home" ? "bg-gray-700" : ""
                    }`}
                  >
                    หน้าหลัก
                  </Link>
                </li>

                {/* เมนูย่อย */}
                <button
                    onClick={() => setShowSubMenu((prev) => !prev)}
                    className={`flex items-center justify-between w-full text-left hover:text-blue-400 ${
                      showSubMenu ? "text-blue-400 font-semibold" : ""
                    }`}
                  >
                    ดูข้อมูลต่างๆ
                    <span
                      className={`transform transition-transform duration-200`}
                    >
                    </span>
                  </button>
                    <div className="ml-4 flex flex-col space-y-2 border-l border-gray-600 pl-4">
                      <Link
                        href="/dashboard-layout/Weather-Data"
                        className={`hover:text-blue-400 ${
                          pathname === "/dashboard-layout/Download" ? "text-blue-400 font-semibold" : ""
                        }`}
                      >
                      สภาพอากาศในแต่ละสถานี
                      </Link>
                        <Link
                        href="/dashboard-layout/Ges"
                        className={`hover:text-blue-400 ${
                          pathname === "/dashboard-layout/Ges" ? "text-blue-400 font-semibold" : ""
                        }`}
                      >
                        ดูข้อมูลแก๊สแต่ละสถานี
                      </Link>
                      <Link
                        href="/dashboard-layout/pm25"
                        className={`hover:text-blue-400 ${
                          pathname === "/dashboard-layout/pm25" ? "text-blue-400 font-semibold" : ""
                        }`}
                      >
                        ดูข้อมูลฝุ่นในแต่ละสถานี
                      </Link>
                    </div>

                {/* เกี่ยวกับเรา */}
                <li>
                  <Link
                    href="/dashboard-layout/About"
                    className={`flex items-center p-2 hover:bg-gray-700 ${
                      pathname === "/dashboard-layout/About"
                        ? "bg-gray-700"
                        : ""
                    }`}
                  >
                    เกี่ยวกับเรา
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
