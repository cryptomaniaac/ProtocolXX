import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  size?: number
}

const defaultProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const ShieldIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export const UploadCloudIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
)

export const TriangleAlertIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const ClockIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const ArrowDownIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
)

export const ListIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

export const BellIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

export const CheckCircleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export const ClipboardListIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
)

export const AtSignIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
)

export const ChevronRightIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

export const ChevronDownIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export const SunIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
)

export const MoonIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)

export const CircleHelpIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const XIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const MinusIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const CopyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
)

export const CheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const SearchIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...defaultProps} className={className} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

// Aliases for compatibility
export const HelpCircleIcon = CircleHelpIcon
export const ArrowUpFromTrayIcon = UploadCloudIcon
export const InfoIcon = CircleHelpIcon
