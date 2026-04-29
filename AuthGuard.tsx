"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/_context/AuthContext";
import Link from "next/link";
import { Exam, ExamResult } from "@/lib/types";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [pendingExams, setPendingExams] = useState<Exam[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [examsSnap, resultsSnap] = await Promise.all([
        getDocs(query(collection(db, "exams"), where("studentIds", "array-contains", profile!.uid))),
        getDocs(query(collection(db, "results"), where("studentId", "==", profile!.uid))),
      ]);

      const allExams = examsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Exam);
      const myResults = resultsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ExamResult);
      const doneIds = new Set(myResults.map((r) => r.examId));
      const now = Date.now();

      setPendingExams(allExams.filter((e) => !doneIds.has(e.id) && (!e.scheduledAt || e.scheduledAt <= now)));
      setUpcomingExams(allExams.filter((e) => !doneIds.has(e.id) && e.scheduledAt && e.scheduledAt > now).sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0)));
      setResults(myResults);
      setLoading(false);
    }

    load();
  }, [profile]);

  const avg = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / results.length)
    : null;

  function formatScheduled(ts: number) {
    return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  }

  const stats = [
    { label: "Bekleyen Sınav", value: loading ? "-" : pendingExams.length, href: "/student/exams" },
    { label: "Planlanmış Sınav", value: loading ? "-" : upcomingExams.length, href: "/student/upcoming" },
    { label: "Tamamlanan", value: loading ? "-" : results.length, href: "/student/results" },
    { label: "Başarı Ortalaması", value: loading ? "-" : avg !== null ? `${avg}%` : "-", href: "/student/results" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Merhaba, {profile?.name}</h2>
        <p className="text-gray-500 text-sm mt-1">Sınav durumunuza genel bakış.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
              <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {!loading && pendingExams.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Aktif Sınavlar</h3>
              <Link href="/student/exams" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Tümü</Link>
            </div>
            <ul className="space-y-2">
              {pendingExams.slice(0, 4).map((ex) => (
                <li key={ex.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{ex.title}</p>
                    <p className="text-xs text-gray-400">{ex.teacherName ?? "Öğretmen"} · {ex.durationMinutes} dk</p>
                  </div>
                  <Link href={`/student/exams/${ex.id}`} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition shrink-0">
                    Gir
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && upcomingExams.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Yaklaşan Sınavlar</h3>
              <Link href="/student/upcoming" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Tümü</Link>
            </div>
            <ul className="space-y-2">
              {upcomingExams.slice(0, 4).map((ex) => (
                <li key={ex.id} className="py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-medium text-gray-800">{ex.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ex.teacherName} · {formatScheduled(ex.scheduledAt!)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
