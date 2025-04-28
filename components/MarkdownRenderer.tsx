// components/MarkdownRenderer.tsx
'use client';

import Markdown from 'markdown-to-jsx';
type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  const formattedContent = content.replace(/([^\n])\n(?!\n)/g, '$1<br />\n');
  return (
    <div className="text-gray-300 whitespace-pre-wrap">
      <Markdown
        options={{
          forceBlock: true,
          forceInline: false,
          overrides: {
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
                <ul className="list-disc pl-5 space-y-2">{children}</ul>
              ),
            },
            li: {
              component: ({ children }) => (
                <li className="text-sm">{children}</li>
              ),
            },
            p: {
              component: ({ children }) => <p className="mb-3">{children}</p>,
            },
            hr: {
              component: () => <hr className="my-4 border-gray-600" />,
            },
            a: {
              component: ({ children, ...props }) => (
                <a
                  {...props}
                  className="text-blue-400 hover:text-blue-600 underline transition-colors duration-200"
                >
                  {children}
                </a>
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
