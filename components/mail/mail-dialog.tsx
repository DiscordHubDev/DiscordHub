'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import {
  getPriorityColorClass,
  getPriorityIcon,
  getPriorityTextClass,
} from './inbox-sidebar';
import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef } from 'react';
import { Mail } from '@/lib/types';

interface CustomEmailDialogProps {
  email: Mail | null;
  open: boolean;
  onClose: () => void;
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function EmailDialog({ email, open, onClose }: CustomEmailDialogProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  // 處理開啟和關閉的動畫
  React.useEffect(() => {
    if (open) {
      // 當對話框打開時，先設置為可見，然後添加動畫類
      setIsVisible(true);
    } else {
      // 當對話框關閉時，先移除動畫類，然後設置為不可見
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200); // 動畫持續時間
      return () => clearTimeout(timer);
    }
  }, [open]);

  // 使用 React.useEffect 添加 ESC 鍵關閉功能
  React.useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  if (!email || !isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200',
        open ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'relative w-auto h-auto rounded-lg shadow-lg overflow-hidden transition-all duration-200',
          getPriorityColorClass(email.priority, false),
          open ? 'scale-100' : 'scale-95',
        )}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold line-clamp-1">{email.subject}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 rounded-full"
            >
              <X className="size-4" />
              <span className="sr-only">關閉</span>
            </Button>
          </div>

          <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              📩 來自: <span className="font-medium">{email.name}</span> ·{' '}
              {email.createdAt}
            </p>

            <span
              className={cn(
                getPriorityTextClass(email.priority),
                'text-sm flex items-center gap-2',
              )}
            >
              {getPriorityIcon(email.priority)}
              {capitalize(email.priority)}
            </span>
          </div>

          <div
            className="mt-4 text-sm prose prose-sm dark:prose-invert max-w-none"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-bold mt-3 mb-1" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 mb-2" {...props} />
                ),
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                a: ({ node, ...props }) => (
                  <a
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2"
                    {...props}
                  />
                ),
                code: ({
                  inline,
                  className,
                  children,
                  ...props
                }: ComponentPropsWithoutRef<'code'> & {
                  inline?: boolean;
                }) =>
                  inline ? (
                    <code
                      className={cn(
                        'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm',
                        className,
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto my-2">
                      <code {...props}>{children}</code>
                    </pre>
                  ),

                pre: ({ node, ...props }) => (
                  <pre
                    className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto my-2"
                    {...props}
                  />
                ),
                hr: ({ node, ...props }) => (
                  <hr
                    className="my-4 border-gray-300 dark:border-gray-600"
                    {...props}
                  />
                ),
              }}
            >
              {email.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
