import React from 'react';
import { twMerge } from 'tailwind-merge';

type PixelButtonSize = 'sm' | 'md' | 'lg';
type PixelButtonColor = 'pink' | 'purple' | 'blue' | 'green' | 'orange' | 'gray';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: PixelButtonSize;
  color?: PixelButtonColor;
  active?: boolean;
}

const COLOR_MAP: Record<PixelButtonColor, { bg: string; border: string; hover: string; active: string }> = {
  pink: {
    bg: 'bg-pink-400',
    border: 'border-pink-600',
    hover: 'hover:bg-pink-300',
    active: 'active:border-b-pink-400 active:border-r-pink-400 active:bg-pink-500',
  },
  purple: {
    bg: 'bg-purple-400',
    border: 'border-purple-600',
    hover: 'hover:bg-purple-300',
    active: 'active:border-b-purple-400 active:border-r-purple-400 active:bg-purple-500',
  },
  blue: {
    bg: 'bg-sky-400',
    border: 'border-sky-600',
    hover: 'hover:bg-sky-300',
    active: 'active:border-b-sky-400 active:border-r-sky-400 active:bg-sky-500',
  },
  green: {
    bg: 'bg-emerald-400',
    border: 'border-emerald-600',
    hover: 'hover:bg-emerald-300',
    active: 'active:border-b-emerald-400 active:border-r-emerald-400 active:bg-emerald-500',
  },
  orange: {
    bg: 'bg-orange-400',
    border: 'border-orange-600',
    hover: 'hover:bg-orange-300',
    active: 'active:border-b-orange-400 active:border-r-orange-400 active:bg-orange-500',
  },
  gray: {
    bg: 'bg-zinc-400',
    border: 'border-zinc-600',
    hover: 'hover:bg-zinc-300',
    active: 'active:border-b-zinc-400 active:border-r-zinc-400 active:bg-zinc-500',
  },
};

const SIZE_MAP: Record<PixelButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function PixelButton({
  children,
  size = 'md',
  color = 'pink',
  active = false,
  className,
  disabled,
  ...props
}: PixelButtonProps) {
  const c = COLOR_MAP[color];
  return (
    <button
      disabled={disabled}
      className={twMerge(
        'font-pixel select-none transition-all duration-75',
        'border-2 border-b-4 border-r-4 border-t-2 border-l-2',
        'text-white tracking-wider uppercase',
        'shadow-[3px_3px_0px_rgba(0,0,0,0.25)]',
        c.bg,
        c.border,
        !disabled && c.hover,
        !disabled && c.active,
        !disabled && 'hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.25)]',
        !disabled && 'active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.25)]',
        disabled && 'opacity-60 cursor-not-allowed',
        active && 'translate-y-[2px] shadow-[1px_1px_0px_rgba(0,0,0,0.25)] brightness-110',
        SIZE_MAP[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
