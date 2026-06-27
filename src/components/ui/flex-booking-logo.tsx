interface FlexBookingLogoMarkProps {
  size?: number
  className?: string
}

export function FlexBookingLogoMark({ size = 32, className }: FlexBookingLogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="2" y="2" width="96" height="96" rx="26" fill="var(--primary)" />
      <rect x="30" y="26" width="11" height="48" rx="5.5" fill="#fff" />
      <rect x="30" y="26" width="40" height="11" rx="5.5" fill="#fff" />
      <rect x="30" y="45" width="25" height="11" rx="5.5" fill="#fff" />
      <rect x="61" y="45" width="11" height="11" rx="3.5" fill="rgba(255,255,255,.55)" />
    </svg>
  )
}
