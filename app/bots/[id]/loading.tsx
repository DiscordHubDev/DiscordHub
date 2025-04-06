export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865f2]"></div>
      <p className="text-sm text-gray-400 animate-breath">
        正在從茫茫大海中獲取ㄐ器人的資訊，請稍候...
      </p>
    </div>
  );
}
