'use client';

import Markdown from 'markdown-to-jsx';
import { useState } from 'react';

type Props = {
  content: string;
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

// 清理和驗證 markdown 內容
const sanitizeContent = (content: string): string => {
  // 移除可能有問題的 HTML 標籤，但保留基本的 markdown
  const dangerousTags = /<script[^>]*>.*?<\/script>/gi;
  let sanitized = content.replace(dangerousTags, '');

  // 處理單行換行
  sanitized = sanitized.replace(/([^\n])\n(?!\n)/g, '$1<br />\n');

  return sanitized;
};

export default function MarkdownRenderer({ content }: Props) {
  const formattedContent = sanitizeContent(content);

  return (
    <div className="text-gray-300 whitespace-pre-wrap">
      <Markdown
        options={{
          forceBlock: true,
          forceInline: false,
          wrapper: 'div',
          overrides: {
            // 安全的圖片處理
            img: {
              component: SafeImage,
            },
            iframe: {
              component: ({ node, ...props }) => (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <iframe {...props} style={{ width: '100%' }} />
                </div>
              ),
            },
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
              component: ({ children, href, ...props }) => (
                <a
                  {...props}
                  href={href}
                  className="text-blue-400 hover:text-blue-600 underline transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
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
