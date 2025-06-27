import { useEffect, useRef } from 'react';

function DiscordWidget({ serverId = '1297055626014490695', theme = 'dark' }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // 動態設置iframe屬性來避免CORS問題
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        try {
          // 可以在這裡處理載入完成後的邏輯
          console.log('Discord widget loaded successfully');
        } catch (error) {
          console.log('Discord widget loaded with some CORS warnings (normal)');
        }
      };
    }
  }, []);

  return (
    <div className="mb-6 mt-4">
      <iframe
        ref={iframeRef}
        src={`https://discord.com/widget?id=${serverId}&theme=${theme}`}
        width="290"
        height="500"
        frameBorder="0"
        title="Discord Server Widget"
        // 移除sandbox或使用更寬鬆的設置
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-forms allow-modals"
        loading="lazy"
        onError={() =>
          console.log('Widget loading error (may be CORS related)')
        }
      />
    </div>
  );
}

export default DiscordWidget;
