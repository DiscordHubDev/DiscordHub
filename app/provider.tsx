'use client';

import { useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.onerror = function (message, source, lineno, colno, error) {
      console.log('🚨 錯誤捕捉到：');
      console.log('訊息 (message):', message);
      console.log('來源檔案 (source):', source);
      console.log('行號 (lineno):', lineno);
      console.log('欄位號 (colno):', colno);
      console.log('錯誤物件 (error):', error);

      // 你也可以組成一個物件來統一上傳或記錄
      const errorDetails = {
        message,
        source,
        lineno,
        colno,
        stack: error?.stack || '無 stack',
        name: error?.name || '無 name',
      };

      console.log('📦 錯誤詳情物件:', errorDetails);
    };
  }, []);

  return <>{children}</>;
}
