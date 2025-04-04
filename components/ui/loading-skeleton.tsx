export default function LoadingSkeleton() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#2b2d31] text-white">
      <div className="text-center animate-pulse">
        <div className="text-xl font-bold mb-2">載入中...</div>
        <div className="text-sm text-gray-400">
          正在取得您的 Discord 伺服器資料
        </div>
      </div>
    </div>
  );
}
