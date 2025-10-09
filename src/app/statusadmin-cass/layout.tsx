"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { FaHome, FaCaretDown, FaEye } from "react-icons/fa";
import { BsFillHouseAddFill } from "react-icons/bs";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [status_Tap, set_Status_Tap] = useState(false);
  const [ShowAddStation, set_ShowAddStation] = useState(false);
  const [ShowStationView, set_ShowStationView] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/check-auth", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setIsAuth(true);
        } else {
          router.replace("/login-amin");
        }
      } catch (err) {
        console.error(err);
        router.replace("/login-amin");
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/api/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      router.push("/login-amin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">กำลังโหลด...</p>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 shadow">
        <div className="flex items-center space-x-3">
          <button className="text-xl" onClick={() => set_Status_Tap((prev) => !prev)}>
            &#9776;
          </button>
          <span className="font-bold text-lg">ระบบจัดการบ้าน</span>
        </div>
        <button onClick={handleLogout} className="text-sm hover:text-red-400">
          ⏻ Logout
        </button>
      </header>

      <div className="flex flex-1">
        {status_Tap && (
          <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 font-bold">เมนูหลัก</div>
            <nav className="flex-1 overflow-y-auto">
              <ul>
                <li>
                  <Link
                    href="/statusadmin-cass/Home"
                    className={`flex items-center p-2 hover:bg-gray-700 ${
                      pathname === "/statusadmin-cass/Home" ? "bg-gray-700" : ""
                    }`}
                  >
                    <FaHome className="mr-2" /> หน้าหลัก
                  </Link>
                </li>
                <li
                  className="mt-3 cursor-pointer"
                  onClick={() => set_ShowStationView((prev) => !prev)}
                >
                  <div
                    className={`flex items-center p-2 hover:bg-gray-700 ${
                      pathname.startsWith("/statusadmin-cass/stationsview")
                        ? "bg-gray-700"
                        : ""
                    }`}
                  >
                    <FaEye className="mr-2" />
                    <Link
                        href="/statusadmin-cass/stationsview">
                          ดูข้อมูลสถานีต่างๆ
                        </Link>
                    <FaCaretDown
                      className={`ml-auto transition-transform duration-200 ${
                        ShowStationView ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </li>

                {ShowStationView && (
                  <ul className="bg-gray-700">
                    <li>
                      <Link
                        href="/statusadmin-cass/stationsview/weather"
                        className={`flex items-center p-2 pl-8 hover:bg-gray-600 ${
                          pathname === "/statusadmin-cass/stationsview/weather"
                            ? "bg-gray-600"
                            : ""
                        }`}
                      >
                        - เพิ่มข้อมูลสภาพอากาศ
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/statusadmin-cass/stationsview/PM_Ges"
                        className={`flex items-center p-2 pl-8 hover:bg-gray-600 ${
                          pathname === "/statusadmin-cass/stationsview/PM_Ges"
                            ? "bg-gray-600"
                            : ""
                        }`}
                      >
                        - เพิ่มข้อมูลฝุ่น PM2.5 และแก๊ส
                      </Link>
                    </li>
                  </ul>
                )}

                <li
                  className="mt-3 cursor-pointer"
                  onClick={() => set_ShowAddStation((prev) => !prev)}
                >
                  <div
                    className={`flex items-center p-2 hover:bg-gray-700 ${
                      pathname.startsWith("/statusadmin-cass/add-station")
                        ? "bg-gray-700"
                        : ""
                    }`}
                  >
                    <BsFillHouseAddFill className="mr-2" />
                    <Link href="/statusadmin-cass/add-station">
                        เพิ่มสถานีต่างๆ
                    </Link>
                    <FaCaretDown
                      className={`ml-auto transition-transform duration-200 ${
                        ShowAddStation ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </li>

                {ShowAddStation && (
                  <ul className="bg-gray-700">
                    <li>
                      <Link
                        href="/statusadmin-cass/add-station/weather"
                        className={`flex items-center p-2 pl-8 hover:bg-gray-600 ${
                          pathname === "/statusadmin-cass/add-station/weather"
                            ? "bg-gray-600"
                            : ""
                        }`}
                      >
                        - เพิ่มข้อมูลสภาพอากาศ
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/statusadmin-cass/add-station/PM_Ges"
                        className={`flex items-center p-2 pl-8 hover:bg-gray-600 ${
                          pathname === "/statusadmin-cass/add-station/PM_Ges"
                            ? "bg-gray-600"
                            : ""
                        }`}
                      >
                        - เพิ่มข้อมูลฝุ่น PM2.5 และแก๊ส
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/statusadmin-cass/add-station/Ges"
                        className={`flex items-center p-2 pl-8 hover:bg-gray-600 ${
                          pathname === "/statusadmin-station/Ges"
                            ? "bg-gray-600"
                            : ""
                        }`}
                      >
                        - เพิ่มข้อมูลสถานีแก๊ส
                      </Link>
                    </li>
                  </ul>
                )}
              </ul>
            </nav>
          </aside>
        )}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}