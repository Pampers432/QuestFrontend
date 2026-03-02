"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const role = getStoredRole();
    const target = role === "Student" ? "/Session" : "/Quests";
    router.replace(target);
  }, [router]);

  return <div style={{ padding: 24 }}>Перенаправление...</div>;
}
