"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/_context/AuthContext";
import { Exam, ExamResult } from "@/lib/types";
import Link from "next/link";

export default function StudentExamsPage() {
  const { profile } = useAuth();
  const [pendingExams, setPendingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [examsSnap, resultsSnap] = await Promise.all([
        getDocs(query(collection(db, "exams"), where("studentIds", "array-contains", profile!.uid))),
        getDocs(query(collection(db, "results"), where("studentId", "==", profile!.uid))),
      ]);

      const allExams = examsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Exam);
      const doneIds = new Set(resultsSnap.docs.map((d) => (d.data() as ExamResult).examId));
      const now = Date.now();

      setPendingExams(
        allExams
          .filter((e) => !doneIds.has(e.id) && (!e.scheduledAt || e.scheduledAt <= now))
          .sort((a, b) => b.createdAt - a.createdAt)
      );
      setLoading(false);
    }

    load();
  }, [profile]);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Sınavlarım</h2>
        <p className="text-gray-500 text-sm mt-1">Girebileceğiniz aktif sınavlar aşağıda listeleniyor.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pendingExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Aktif sınav bulunmuyor</p>
          <p className="text-gray-400 text-sm mt-1">Tüm sınavları tamamladınız veya henüz sınav atanmadı.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pendingExams.map((ex) => (
            <div key={ex.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="h-1 bg-indigo-500" />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-1 text-base">{ex.title}</h3>
                {ex.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ex.description}</p>
                )}
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{ex.teacherName ?? "Öğretmen"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{ex.durationMinutes} dakika · {ex.questions.length} soru</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(ex.createdAt)}</span>
                  </div>
                </div>
                <Link
                  href={`/student/exams/${ex.id}`}
                  className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                >
                  Sınava Gir
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
