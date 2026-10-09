import React from 'react'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  children: React.ReactNode
}

export const Chip: React.FC<ChipProps> = ({
  icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border bg-transparent text-ink text-sm font-normal hover:bg-card-raised transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}
