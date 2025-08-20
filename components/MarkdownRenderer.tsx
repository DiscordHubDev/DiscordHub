'use client';

import Markdown from 'markdown-to-jsx';
import { useState } from 'react';

type Props = {
  content: string;
};

const stripScriptTags = (input: string) =>
  input.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');

const parseSafeUrl = (raw?: string) => {
  if (!raw) return null;
  try {
    const u = new URL(
      raw,
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://example.com',
    );
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    return u;
  } catch {
    return null;
  }
};

const mapPerms = (perms?: string) => {
  const set = new Set(
    (perms || '')
      .split(/[,\s]+/)
      .map(s => s.trim().toLowerCase())
      .filter(Boolean),
  );

  const SBOX: Record<string, string> = {
    scripts: 'allow-scripts',
    forms: 'allow-forms',
    popups: 'allow-popups',
    presentation: 'allow-presentation',
    topnav: 'allow-top-navigation-by-user-activation',
  };

  const tokens = ['']; // 空字串避免 join 為空
  for (const k of set) if (SBOX[k]) tokens.push(SBOX[k]);
  return tokens.join(' ').trim();
};

type SafeIframeProps = {
  src?: string;
  title?: string;
  ['data-perms']?: string;
  className?: string;
};

const SafeIframe = ({ src, title, className, ...rest }: SafeIframeProps) => {
  const url = parseSafeUrl(src);

  if (!url) {
    return (
      <div className="bg-gray-700 p-4 rounded text-gray-300 text-sm">
        無法嵌入（只允許 http/https）。
        {src && (
          <div className="mt-2 break-all">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            ></a>
          </div>
        )}
      </div>
    );
  }

  const sandbox = mapPerms((rest as any)['data-perms']);
  const allow = '';

  return (
    <div
      className={`aspect-video w-full my-4 rounded overflow-hidden border border-gray-600 ${className || ''}`}
    >
      <iframe
        src={url.toString()}
        title={title || `Embedded content`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox={sandbox || undefined}
        allow={allow}
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};

// 安全的圖片組件
const SafeImage = ({
  src,
  alt,
  ...props
}: {
  src?: string;
  alt?: string;
  [key: string]: any;
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src) {
    return (
      <div className="bg-gray-700 p-4 rounded text-gray-400 text-center">
        圖片載入失敗：缺少圖片來源
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-gray-700 p-4 rounded text-gray-400 text-center">
        <div>圖片載入失敗</div>
        <div className="text-xs mt-1 break-all">{src}</div>
      </div>
    );
  }

  return (
    <div className="my-4 text-center">
      {isLoading && (
        <div className="bg-gray-700 p-4 rounded text-gray-400 animate-pulse">
          載入圖片中...
        </div>
      )}
      <img
        {...props}
        src={src}
        alt={alt || '圖片'}
        className="max-w-full h-auto rounded shadow-lg"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={{ display: isLoading ? 'none' : 'block', margin: '0 auto' }}
      />
    </div>
  );
};

// 更強的內容清理函數
const sanitizeContent = (content: string): string => {
  let s = content
    // 移除 script/style 等
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '')
    // 移除事件處理器屬性（任意標籤）
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // 移除 iframe 的 srcdoc 屬性（避免把任意 HTML 注入）
    .replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
    // 禁止 javascript/vbscript/livescript 協定
    .replace(
      /((?:href|src)\s*=\s*["']?)\s*(?:javascript|vbscript|livescript)\s*:/gi,
      '$1unsafe:',
    )
    // 若有 data:text/html 也直接標 unsafe
    .replace(
      /((?:href|src)\s*=\s*["']?)\s*data\s*:\s*text\/html/gi,
      '$1unsafe:text/html',
    );

  // 單行換行 → Markdown 硬換行（或保留原本 <br /> 也可，取一種）
  s = s.replace(/([^\n])\n(?!\n)/g, '$1  \n');
  return s;
};

// 移除不安全的內容塊
const removeUnsafeBlocks = (content: string): string => {
  let cleaned = content;

  // 移除包含危險模式的整個段落或行
  const dangerousPatterns = [
    /<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi,
    /<[^>]*\s+on\w+\s*=\s*[^>]*>/gi,
    /javascript\s*:[^\s\n]*/gi,
    /vbscript\s*:[^\s\n]*/gi,
    /livescript\s*:[^\s\n]*/gi,
    /<\s*object[\s\S]*?<\s*\/\s*object\s*>/gi,
    /<\s*embed[^>]*>/gi,
    /<\s*form[\s\S]*?<\s*\/\s*form\s*>/gi,
    /eval\s*\([^)]*\)/gi,
    /expression\s*\([^)]*\)/gi,
  ];

  dangerousPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned;
};

export default function MarkdownRenderer({ content }: Props) {
  const contentWithoutScript = stripScriptTags(content);
  const cleanedContent = removeUnsafeBlocks(contentWithoutScript);
  const formattedContent = sanitizeContent(cleanedContent);

  return (
    <div className="text-gray-300 whitespace-pre-wrap">
      <Markdown
        options={{
          forceBlock: true,
          forceInline: false,
          wrapper: 'div',
          disableParsingRawHTML: false,
          overrides: {
            img: { component: SafeImage },
            iframe: { component: SafeIframe },
            h1: {
              component: ({ children }) => (
                <h1 className="text-2xl font-bold mt-4 mb-3">{children}</h1>
              ),
            },
            h2: {
              component: ({ children }) => (
                <h2 className="text-xl font-semibold mt-3 mb-2">{children}</h2>
              ),
            },
            h3: {
              component: ({ children }) => (
                <h3 className="text-lg font-medium mt-2 mb-2">{children}</h3>
              ),
            },
            ul: {
              component: ({ children }) => (
                <ul className="list-disc pl-5 space-y-2 my-3">{children}</ul>
              ),
            },
            ol: {
              component: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-2 my-3">{children}</ol>
              ),
            },
            li: {
              component: ({ children }) => (
                <li className="text-sm">{children}</li>
              ),
            },
            p: {
              component: ({ children }) => (
                <p className="mb-3 leading-relaxed">{children}</p>
              ),
            },
            hr: {
              component: () => <hr className="my-6 border-gray-600" />,
            },
            a: {
              component: ({ children, href, ...props }) => {
                // 驗證連結的安全性
                const safeHref =
                  href &&
                  (href.startsWith('http://') ||
                    href.startsWith('https://') ||
                    href.startsWith('mailto:') ||
                    href.startsWith('#') ||
                    href.startsWith('/'))
                    ? href
                    : '#';

                return (
                  <a
                    {...props}
                    href={safeHref}
                    className="text-blue-400 hover:text-blue-600 underline transition-colors duration-200"
                    target={safeHref.startsWith('http') ? '_blank' : undefined}
                    rel={
                      safeHref.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    {children}
                  </a>
                );
              },
            },
            // 處理程式碼區塊
            pre: {
              component: ({ children }) => (
                <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto my-4 border border-gray-600">
                  {children}
                </pre>
              ),
            },
            code: {
              component: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-200">
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className={`${className} text-gray-200 font-mono text-sm`}
                  >
                    {children}
                  </code>
                );
              },
            },
            // 處理表格
            table: {
              component: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-gray-600 bg-gray-800">
                    {children}
                  </table>
                </div>
              ),
            },
            th: {
              component: ({ children }) => (
                <th className="border border-gray-600 px-4 py-2 bg-gray-700 font-semibold">
                  {children}
                </th>
              ),
            },
            td: {
              component: ({ children }) => (
                <td className="border border-gray-600 px-4 py-2">{children}</td>
              ),
            },
            // 處理引用
            blockquote: {
              component: ({ children }) => (
                <blockquote className="border-l-4 border-blue-400 pl-4 my-4 italic text-gray-300 bg-gray-800 py-2">
                  {children}
                </blockquote>
              ),
            },
          },
        }}
      >
        {formattedContent}
      </Markdown>
    </div>
  );
}
