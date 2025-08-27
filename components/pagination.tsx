'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // 如果只有一頁，不顯示分頁
  if (totalPages <= 1) return null;

  // 使用 useMemo 優化性能，避免不必要的重新計算
  const pageNumbers = useMemo(() => {
    const MAX_PAGES_TO_SHOW = 5;
    const pages: (number | string)[] = [];

    // 如果總頁數小於等於最大顯示數，顯示所有頁碼
    if (totalPages <= MAX_PAGES_TO_SHOW) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 計算顯示範圍
    const SIDE_PAGES = 1; // 當前頁兩側顯示的頁數
    let startPage = Math.max(2, currentPage - SIDE_PAGES);
    let endPage = Math.min(totalPages - 1, currentPage + SIDE_PAGES);

    // 確保至少顯示3個中間頁碼（如果可能）
    const middlePageCount = endPage - startPage + 1;
    if (middlePageCount < 3) {
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, startPage + 2);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - 2);
      }
    }

    // 總是顯示第一頁
    pages.push(1);

    // 添加左側省略號
    if (startPage > 2) {
      pages.push('ellipsis-start');
    }

    // 添加中間頁碼
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // 添加右側省略號
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // 總是顯示最後一頁（避免重複）
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  // 安全的頁面變更處理
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // 渲染頁碼按鈕
  const renderPageButton = (page: number | string) => {
    const isEllipsis = typeof page === 'string';

    if (isEllipsis) {
      return (
        <Button
          key={page}
          variant="outline"
          size="icon"
          disabled
          className="bg-[#36393f] border-[#1e1f22] text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    }

    const pageNumber = page as number;
    const isCurrentPage = currentPage === pageNumber;

    return (
      <Button
        key={pageNumber}
        variant={isCurrentPage ? 'default' : 'outline'}
        onClick={() => handlePageChange(pageNumber)}
        className={
          isCurrentPage
            ? 'bg-[#5865f2] hover:bg-[#4752c4] text-white'
            : 'bg-[#36393f] border-[#1e1f22] text-white hover:bg-[#4f545c] hover:text-white'
        }
      >
        {pageNumber}
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* 上一頁按鈕 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-[#36393f] border-[#1e1f22] text-white hover:bg-[#4f545c] hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 頁碼按鈕 */}
      {pageNumbers.map(renderPageButton)}

      {/* 下一頁按鈕 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-[#36393f] border-[#1e1f22] text-white hover:bg-[#4f545c] hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
