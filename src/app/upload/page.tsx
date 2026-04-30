import Link from "next/link";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F4A0A0" }}>
      <div className="max-w-sm mx-auto px-4 pt-10 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-white/80 hover:text-white text-sm">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-gray-900">上傳照片</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <UploadForm />
        </div>
      </div>
    </main>
  );
}
