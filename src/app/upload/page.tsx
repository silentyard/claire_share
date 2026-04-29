import Link from "next/link";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← 返回相簿
          </Link>
          <h1 className="text-xl font-bold text-gray-800">上傳照片</h1>
        </div>
      </header>

      <section className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <UploadForm />
        </div>
      </section>
    </main>
  );
}
