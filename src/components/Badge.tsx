import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  success: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60',
  warning: 'bg-amber-950/70 text-amber-300 border-amber-700/60',
  danger: 'bg-rose-950/70 text-rose-300 border-rose-700/60',
  info: 'bg-sky-950/70 text-sky-300 border-sky-700/60',
  purple: 'bg-indigo-950/70 text-indigo-300 border-indigo-700/60',
  outline: 'bg-transparent text-slate-400 border-slate-800',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-xs px-3 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
