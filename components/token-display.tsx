'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from './ui/button';
import { createOrRegenerateApiKey, getApiToken } from '@/lib/actions/token';

type Props = {
  id: string;
};

export function APIKeyButton({ id }: Props) {
  const [apiKey, setApiKey] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // 掛載時檢查有沒有 token（不拿明文）
  useEffect(() => {
    (async () => {
      const tokenInfo = await getApiToken(id || '');
      setHasToken(!!tokenInfo);
    })();
  }, [id]);

  const handleCreateOrRegen = async () => {
    try {
      const tokens = await createOrRegenerateApiKey();
      setApiKey(tokens); // 一次性顯示
      setShowWarning(true); // 顯示警語
      await navigator.clipboard.writeText(tokens.accessToken);
      toast.success('存取令牌已建立並複製到剪貼簿！');
      setHasToken(true);
    } catch (err) {
      toast.error('操作失敗');
    }
  };

  return (
    <div className="flex flex-col items-center mt-4 space-y-6 w-full">
      {apiKey && (
        <div className="space-y-4 w-full">
          <div className="text-yellow-200 rounded-md text-xl ">
            ⚠️ 此 API Key
            僅會顯示一次，請妥善保存。離開或重新整理後將無法再次查看。
          </div>
          <TokenDisplay label="存取令牌" token={apiKey.accessToken} />
          <TokenDisplay label="重整令牌" token={apiKey.refreshToken} />
        </div>
      )}
      <Button
        className="discord text-white cursor-pointer"
        onClick={handleCreateOrRegen}
      >
        {apiKey || hasToken ? (
          <>
            <RefreshCw size={16} className="mr-2" />
            重新建立 API Key
          </>
        ) : (
          <>
            <Plus size={16} className="mr-2" />
            建立 API Key
          </>
        )}
      </Button>
    </div>
  );
}

function TokenDisplay({ label, token }: { label: string; token: string }) {
  const copy = () => {
    navigator.clipboard.writeText(token);
    toast.success(`${label} 已複製成功！`);
  };

  return (
    <div>
      <p className="text-gray-200 mb-2">{label}：</p>
      <div
        className="p-3 bg-gray-800 rounded-md font-mono text-sm text-gray-100 break-all cursor-pointer hover:bg-gray-700 transition"
        onClick={copy}
      >
        {token}
      </div>
    </div>
  );
}
