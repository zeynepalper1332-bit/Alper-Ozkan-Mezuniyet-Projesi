"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/app/_context/AuthContext";

interface NavItem {
  href: string;
  label: string;
}

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Anasayfa" },
  { href: "/teacher/students", label: "Öğrenciler" },
  { href: "/teacher/exams", label: "Sınavlarım" },
  { href: "/teacher/exams/create", label: "Sınav Oluştur" },
  { href: "/teacher/exams/results", label: "Sonuçlar" },
];

const studentNav: NavItem[] = [
  { href: "/student", label: "Anasayfa" },
  { href: "/student/upcoming", label: "Sınav Programı" },
  { href: "/student/exams", label: "Sınavlarım" },
  { href: "/student/results", label: "Sonuçlarım" },
];

export default function Sidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = profile?.role === "teacher" ? teacherNav : studentNav;
  const initials = profile?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "";

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col">
      <div className="px-5 py-6 border-b border-gray-800">
        <p className="text-white font-bold text-base tracking-tight">SınavSistemi</p>
        <p className="text-gray-500 text-xs mt-0.5">
          {profile?.role === "teacher" ? "Öğretmen Paneli" : "Öğrenci Paneli"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            item.href === "/teacher" || item.href === "/student"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile?.name}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
