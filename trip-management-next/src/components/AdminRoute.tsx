"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoute({ children }: any) {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.id) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      alert("Access denied ❌ Admin only");
      router.push("/");
      return;
    }
  }, []);

  return <>{children}</>;
}