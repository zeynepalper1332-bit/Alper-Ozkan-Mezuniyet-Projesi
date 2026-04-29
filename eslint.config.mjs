"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/_context/AuthContext";
import Link from "next/link";

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [examCount, setExamCount] = useState(0);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [studentsSnap, examsSnap, resultsSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("teacherId", "==", profile!.uid), where("role", "==", "student"))),
        getDocs(query(collection(db, "exams"), where("teacherId", "==", profile!.uid))),
        getDocs(query(collection(db, "results"), where("teacherId", "==", profile!.uid))),
      ]);
      setStudentCount(studentsSnap.size);
      setExamCount(examsSnap.size);
      setResultCount(resultsSnap.size);
    }

    load();
  }, [profile]);

  const stats = [
    { label: "Öğrenciler", value: studentCount, href: "/teacher/students", desc: "Kayıtlı öğrenci" },
    { label: "Sınavlar", value: examCount, href: "/teacher/exams/create", desc: "Oluşturulan sınav" },
    { label: "Sonuçlar", value: resultCount, href: "/teacher/exams/results", desc: "Tamamlanan sınav" },
  ];

  const quickActions = [
    { href: "/teacher/students", title: "Öğrenci Ekle", desc: "Sisteme öğrenci ekleyin ve yönetin." },
    { href: "/teacher/exams/create", title: "Sınav Oluştur", desc: "Yeni sınav oluşturun, tarih ve saat belirleyin." },
    { href: "/teacher/exams/results", title: "Sonuçları Görüntüle", desc: "Öğrenci performanslarını analiz edin." },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Merhaba, {profile?.name}</h2>
        <p className="text-gray-500 text-sm mt-1">Sisteminizin genel durumuna buradan bakabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
              <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm font-medium text-gray-700">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hızlı İşlemler</h3>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {quickActions.map((a) => (
          <Link key={a.href} href={a.href}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-200 hover:shadow-sm transition-all h-full">
              <p className="font-semibold text-gray-900 mb-1 text-sm">{a.title}</p>
              <p className="text-xs text-gray-500">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
