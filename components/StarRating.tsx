'use client';
import { useSession } from 'next-auth/react';
import React, { useId, useState } from 'react';

type StarRatingProps = {
  value: number; // 0 ~ 滿，可 0.5
  max?: number; // 預設是5
  size?: number; // px，預設是28
  fillColor?: string; // 已填滿顏色
  emptyColor?: string; // 邊框顏色
  backgroundColor?: string; // 未填滿背景顏色
  gap?: number; // 星與星的間距
  interactive?: boolean; // 是否可點擊或調整
  onChange?: (value: number) => void; // 回傳新的值（半星）
  ariaLabel?: string;
  className?: string;
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  size = 28,
  fillColor = '#F59E0B',
  emptyColor = '#9CA3AF',
  backgroundColor = '#E5E7EB',
  gap = 6,
  interactive = false,
  onChange,
  ariaLabel = 'Rating',
  className,
}) => {
  const { data: session } = useSession();
  
  // 如果未登入，不顯示按鈕
  if (!session) {
    return null;
  }

  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // 移除可能導致組件不渲染的 session 檢查
  // if (
  //   session?.discordProfile?.id &&
  //   session?.error === 'RefreshAccessTokenError'
  // ) {
  //   return null;
  // }

  const safeValue = Math.max(0, Math.min(value ?? 0, max));
  const displayValue = hoverValue !== null ? hoverValue : safeValue;
  const stars = Array.from({ length: max }, (_, i) => i);

  const calculateRating = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // 計算每個星星的位置
    for (let i = 0; i < max; i++) {
      const starStart = i * (size + gap);
      const starEnd = starStart + size;

      if (x >= starStart && x <= starEnd) {
        const starX = x - starStart;
        const fraction = starX <= size / 2 ? 0.5 : 1;
        return i + fraction;
      }
    }

    // 如果點擊在間隙中，找到最近的星星
    const totalWidth = max * size + (max - 1) * gap;
    if (x <= 0) return 0;
    if (x >= totalWidth) return max;

    const starIndex = Math.floor(x / (size + gap));
    return Math.min(max, starIndex + 1);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onChange) return;
    const newRating = calculateRating(e);
    onChange(newRating);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const newRating = calculateRating(e);
    setHoverValue(newRating);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverValue(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !onChange) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(0, roundToHalf(safeValue - 0.5)));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(max, roundToHalf(safeValue + 0.5)));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      role={interactive ? 'slider' : 'img'}
      aria-label={`${ariaLabel}: ${safeValue} out of ${max}`}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? max : undefined}
      aria-valuenow={interactive ? Number(safeValue.toFixed(1)) : undefined}
      tabIndex={interactive ? 0 : -1}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {stars.map(i => {
        const starIndex = i + 1;
        let fillPercent = 0;
        if (displayValue >= starIndex) {
          fillPercent = 100;
        } else if (displayValue > i && displayValue < starIndex) {
          fillPercent = (displayValue - i) * 100; // 半星
        }

        return (
          <Star
            key={i}
            index={i}
            size={size}
            fillColor={fillColor}
            emptyColor={emptyColor}
            backgroundColor={backgroundColor}
            fillPercent={fillPercent}
            isHovering={hoverValue !== null}
          />
        );
      })}
    </div>
  );
};

function Star({
  index,
  size,
  fillColor,
  emptyColor,
  backgroundColor,
  fillPercent,
  isHovering = false,
}: {
  index: number;
  size: number;
  fillColor: string;
  emptyColor: string;
  backgroundColor: string;
  fillPercent: number; // 0~100
  isHovering?: boolean;
}) {
  const id = useId();
  const starPath =
    'M12 .587l3.668 7.431 8.206 1.193-5.937 5.79 1.402 8.174L12 19.771l-7.339 3.904 1.402-8.174L.126 9.211l8.206-1.193L12 .587z';

  const clipId = `${id}-clip-${index}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        display: 'block',
        transition: isHovering ? 'transform 0.1s ease' : 'none',
        transform: isHovering && fillPercent > 0 ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={(fillPercent / 100) * 24} height="24" />
        </clipPath>
      </defs>

      {/* 背景未填滿 */}
      <path
        d={starPath}
        fill={backgroundColor}
        stroke={emptyColor}
        strokeWidth={1}
      />
      {/* 前景填滿 */}
      <g clipPath={`url(#${clipId})`}>
        <path
          d={starPath}
          fill={fillColor}
          stroke={fillColor}
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}

function roundToHalf(n: number) {
  return Math.round(n * 2) / 2;
}

export default StarRating;
