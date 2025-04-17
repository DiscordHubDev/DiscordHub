'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

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

  // 計算要顯示的頁碼
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // 最多顯示的頁碼數量

    if (totalPages <= maxPagesToShow) {
      // 如果總頁數小於等於最大顯示數，顯示所有頁碼
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 總是顯示第一頁
      pageNumbers.push(1);

      // 計算中間頁碼
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // 調整以確保顯示3個中間頁碼
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, startPage + 2);
      }
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - 2);
      }

      // 添加省略號
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }

      // 添加中間頁碼
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // 添加省略號
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }

      // 總是顯示最後一頁
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* 上一頁按鈕 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-[#36393f] border-[#1e1f22] text-white hover:bg-[#4f545c] hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 頁碼按鈕 */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="outline"
              size="icon"
              disabled
              className="bg-[#36393f] border-[#1e1f22] text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        return (
          <Button
            key={index}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => onPageChange(page as number)}
            className={
              currentPage === page
                ? 'bg-[#5865f2] hover:bg-[#4752c4] text-white'
                : 'bg-[#36393f] border-[#1e1f22] text-white hover:bg-[#4f545c] hover:text-white'
            }
          >
            {page}
          </Button>
        );
      })}

      {/* 下一頁按鈕 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-[#36393f] border-[#1e1f22] text-white hover:bg-[#4f545c] hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
