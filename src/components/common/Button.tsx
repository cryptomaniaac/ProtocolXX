import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'icon'
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  fullWidth = false,
  className = '',
  disabled = false,
  children,
  ...props
}) => {
  let variantStyles = ''

  if (variant === 'primary') {
    variantStyles =
      'bg-accent text-on-accent border-0 h-11 px-5 hover:opacity-90 active:opacity-95'
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-transparent text-ink border border-border-strong h-11 px-5 hover:bg-card-raised'
  } else if (variant === 'text') {
    variantStyles =
      'bg-transparent text-accent border-0 p-0 h-auto hover:underline'
  } else if (variant === 'icon') {
    variantStyles =
      'w-11 h-11 bg-transparent text-ink border-0 flex items-center justify-center hover:bg-card-raised'
  }

  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${widthStyle} ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
