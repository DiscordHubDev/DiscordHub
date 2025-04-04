export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#2b2d31] text-white">
      <div className="text-center animate-pulse">
        <h2 className="text-2xl font-semibold mb-2">載入中...</h2>
        <p className="text-gray-400 text-sm">正在取得您的 Discord 伺服器清單</p>
      </div>
    </div>
  );
}
