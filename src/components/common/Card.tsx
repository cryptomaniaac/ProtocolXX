import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  interactive?: boolean
  selected?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  selected = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'bg-surface dark:bg-surface-dark border rounded-lg p-4 md:p-6 transition-all duration-150'

  const borderStyle = selected
    ? 'border-[#1A6B6B] dark:border-[#2D9B9B] ring-1 ring-[#1A6B6B] dark:ring-[#2D9B9B]'
    : 'border-border dark:border-border-dark'

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-[#1A6B6B]/60 dark:hover:border-[#2D9B9B]/60 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md'
    : 'shadow-[0_1px_3px_rgba(0,0,0,0.06)]'

  return (
    <div
      className={`${baseStyles} ${borderStyle} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
