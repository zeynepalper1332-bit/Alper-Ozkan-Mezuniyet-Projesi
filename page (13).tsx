import Sidebar from "@/app/_components/Sidebar";
import AuthGuard from "@/app/_components/AuthGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="student">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 max-w-5xl">{children}</main>
      </div>
    </AuthGuard>
  );
}
