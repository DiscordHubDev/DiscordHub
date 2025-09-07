'use client';
import React, { useId } from 'react';

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
  const safeValue = Math.max(0, Math.min(value ?? 0, max));
  const stars = Array.from({ length: max }, (_, i) => i);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalWidth = max * size + (max - 1) * gap;
    const clamped = Math.max(0, Math.min(x, totalWidth));
    const unit = size + gap;
    const idx = Math.floor(clamped / unit);
    const withinStarX = clamped - idx * unit;
    const fraction = withinStarX <= size / 2 ? 0.5 : 1;
    const computed = Math.min(max, idx + fraction);
    onChange(computed);
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
      onKeyDown={handleKeyDown}
    >
      {stars.map(i => {
        const starIndex = i + 1;
        let fillPercent = 0;
        if (safeValue >= starIndex) {
          fillPercent = 100;
        } else if (safeValue > i && safeValue < starIndex) {
          fillPercent = (safeValue - i) * 100; // 半星
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
}: {
  index: number;
  size: number;
  fillColor: string;
  emptyColor: string;
  backgroundColor: string;
  fillPercent: number; // 0~100
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
      style={{ display: 'block' }}
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
