'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen px-10">
      <div className="max-w-md w-full text-center p-5 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          🚫 沒有權限存取
        </h1>
        <p className="text-white mb-6">
          很抱歉，您沒有存取此頁面的權限。如果您認為這是錯誤，請聯絡管理員。
        </p>
        <Button onClick={() => router.push('/')} className="w-full">
          返回首頁
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
