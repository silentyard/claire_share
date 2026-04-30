import Link from "next/link";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[402px] mx-auto px-4 pt-10 pb-10">
        <div className="flex items-center justify-between mb-6 bg-white/40 px-4 py-2 rounded-xl">
          <h1 className="text-xl font-bold text-pink-600">上傳照片</h1>
          <Link href="/" className="text-pink-500 font-medium text-sm hover:text-pink-700 bg-white/60 px-3 py-1 rounded-lg transition-colors">
            返回
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <UploadForm />
        </div>
      </div>
    </main>
  );
}
