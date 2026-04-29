"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/_context/AuthContext";
import { Answer, Exam } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function TakeExamPage({ params }: PageProps<"/student/exams/[examId]">) {
  const { profile } = useAuth();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      const { examId } = await params;
      if (!profile) return;

      const doneSnap = await getDocs(
        query(collection(db, "results"), where("studentId", "==", profile.uid), where("examId", "==", examId))
      );
      if (!doneSnap.empty) {
        setAlreadyDone(true);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "exams", examId));
      if (!snap.exists()) {
        router.replace("/student/exams");
        return;
      }
      const data = { id: snap.id, ...snap.data() } as Exam;
      setExam(data);
      setTimeLeft(data.durationMinutes * 60);
      setLoading(false);
    }
    load();
  }, [profile, params, router]);

  useEffect(() => {
    if (!exam || alreadyDone) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [exam]);

  async function handleSubmit() {
    if (!exam || !profile || submitting) return;
    setSubmitting(true);
    clearInterval(intervalRef.current!);

    const answerList: Answer[] = exam.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? -1,
    }));

    const score = answerList.filter(
      (a, i) => a.selectedIndex === exam.questions[i].correctIndex
    ).length;

    await addDoc(collection(db, "results"), {
      examId: exam.id,
      examTitle: exam.title,
      teacherId: exam.teacherId,
      studentId: profile.uid,
      studentName: profile.name,
      answers: answerList,
      score,
      totalQuestions: exam.questions.length,
      submittedAt: Date.now(),
    });

    router.push("/student/results");
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="max-w-lg mx-auto text-center mt-20">
        <p className="text-gray-600 text-lg font-medium mb-4">Bu sınavı zaten tamamladınız.</p>
        <button onClick={() => router.push("/student/results")} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
          Sonuçları Gör
        </button>
      </div>
    );
  }

  if (!exam) return null;

  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{exam.title}</h2>
          <p className="text-sm text-gray-400 mt-1">{exam.questions.length} soru · {exam.durationMinutes} dakika</p>
        </div>
        <div className={`text-lg font-mono font-bold px-4 py-2 rounded-xl ${timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-indigo-50 text-indigo-700"}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {exam.questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="font-medium text-gray-800 mb-4">
              <span className="text-indigo-600 font-semibold mr-2">{qi + 1}.</span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                    answers[q.id] === oi
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{answered}/{exam.questions.length} soru yanıtlandı</p>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-60"
        >
          {submitting ? "Gönderiliyor..." : "Sınavı Bitir"}
        </button>
      </div>
    </div>
  );
}
