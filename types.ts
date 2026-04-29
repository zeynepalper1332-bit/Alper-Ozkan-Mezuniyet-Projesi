"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_context/AuthContext";

interface Props {
  role: "teacher" | "student";
  children: React.ReactNode;
}

export default function AuthGuard({ role, children }: Props) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile && profile.role !== role) {
      router.replace(profile.role === "teacher" ? "/teacher" : "/student");
    }
  }, [loading, user, profile, role, router]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profile.role !== role) return null;

  return <>{children}</>;
}
