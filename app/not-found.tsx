export default function NotFound() {
  return (
    <div className="h-screen bg-black flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-white">404 - 找不到頁面</h1>
        <p className="text-white text-lg">
          你所尋找的頁面不存在，或可能已被移除。
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
        >
          回到首頁
        </a>
      </div>
    </div>
  );
}
