"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/_context/AuthContext";
import { ExamResult } from "@/lib/types";

export default function StudentResultsPage() {
  const { profile } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getDocs(query(collection(db, "results"), where("studentId", "==", profile.uid))).then((snap) => {
      const sorted = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as ExamResult)
        .sort((a, b) => b.submittedAt - a.submittedAt);
      setResults(sorted);
      setLoading(false);
    });
  }, [profile]);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function scoreLabel(score: number, total: number) {
    const pct = Math.round((score / total) * 100);
    if (pct >= 85) return { label: "Mükemmel", color: "text-green-700 bg-green-100" };
    if (pct >= 70) return { label: "İyi", color: "text-blue-700 bg-blue-100" };
    if (pct >= 50) return { label: "Orta", color: "text-yellow-700 bg-yellow-100" };
    return { label: "Geliştirilmeli", color: "text-red-700 bg-red-100" };
  }

  const avg =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / results.length)
      : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Sonuçlarım</h2>
      <p className="text-gray-500 text-sm mb-8">Tamamladığınız sınavların sonuçları.</p>

      {!loading && results.length > 0 && avg !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="bg-indigo-500 text-white text-2xl w-14 h-14 rounded-2xl flex items-center justify-center font-bold">
            {avg}%
          </div>
          <div>
            <p className="font-semibold text-gray-800">Genel Başarı Ortalamanız</p>
            <p className="text-sm text-gray-400">{results.length} sınav tamamlandı</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Yükleniyor...</p>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">Henüz tamamladığınız sınav bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => {
            const { label, color } = scoreLabel(r.score, r.totalQuestions);
            const pct = Math.round((r.score / r.totalQuestions) * 100);
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{r.examTitle}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.submittedAt)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{label}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-20 text-right">
                    {r.score}/{r.totalQuestions} ({pct}%)
                  </span>
                </div>

                {avg !== null && (
                  <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                      <span className="text-xs text-gray-400">Genel ortalamanız</span>
                      <span className="text-xs font-semibold text-gray-600">{avg}%</span>
                    </div>
                    {pct > avg ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Ortalamanın {pct - avg}% üstünde
                      </span>
                    ) : pct < avg ? (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        Ortalamanın {avg - pct}% altında
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Ortalamadasınız
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
