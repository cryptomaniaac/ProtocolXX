import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text'
  size?: 'md' | 'sm'
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#1A6B6B] dark:focus-visible:outline-[#2D9B9B] focus-visible:outline-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizeStyles =
    size === 'sm'
      ? 'min-h-[36px] px-3 text-[13px] gap-1.5'
      : 'min-h-[44px] md:min-h-[48px] px-5 text-[15px] gap-2'

  let variantStyles = ''
  if (variant === 'primary') {
    // Warm accent CTA - used only for primary call to actions
    variantStyles =
      'bg-[#C96A2E] hover:bg-[#B25A24] text-white border-transparent shadow-sm active:translate-y-px'
  } else if (variant === 'outline') {
    variantStyles =
      'bg-transparent hover:bg-[#1A6B6B]/5 text-[#1A6B6B] dark:text-[#2D9B9B] border border-[#1A6B6B] dark:border-[#2D9B9B]'
  } else if (variant === 'text') {
    variantStyles =
      'bg-transparent text-[#1A6B6B] dark:text-[#2D9B9B] hover:underline p-0 min-h-0'
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
