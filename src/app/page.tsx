"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    router.replace("/dashboard-layout/Home");

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: "2rem" }}>
        <p aria-live="polite">กำลังตรวจสอบสิทธิ์...</p>
        <span role="img" aria-label="loading">🔄</span>
      </div>
    );
  }

  return null;
}
