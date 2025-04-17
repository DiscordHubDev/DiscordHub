// components/MarkdownRenderer.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // 你也可以換成其他風格

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-invert max-w-none text-gray-300 prose-li:marker:text-gray-400 prose-ul:pl-5 whitespace-pre-line">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img src={src || ''} alt={alt || ''} loading="lazy" />
          ),
          p: ({ children }) => (
            <p className="whitespace-pre-line text-gray-300 text-sm">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-300">{children}</li>
          ),
        }}
      />
    </div>
  );
}
