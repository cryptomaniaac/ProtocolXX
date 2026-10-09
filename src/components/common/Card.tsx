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
  const baseStyles = 'bg-card border rounded-2xl p-4 sm:p-6 transition-colors'

  const borderStyle = selected
    ? 'border-border-strong outline outline-2 outline-accent'
    : 'border-border'

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-border-strong hover:bg-card-raised focus-visible:outline-2 focus-visible:outline-accent'
    : ''

  return (
    <div
      className={`${baseStyles} ${borderStyle} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const InputCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-card border border-border rounded-2xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
