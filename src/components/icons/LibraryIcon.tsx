type LibraryIconProps = {
  className?: string
}

export function LibraryIcon({ className }: LibraryIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M4 5.5c2.9-.7 5.5 0 8 2.1v12c-2.5-2.1-5.1-2.8-8-2.1Z" />
      <path d="M20 5.5c-2.9-.7-5.5 0-8 2.1v12c2.5-2.1 5.1-2.8 8-2.1Z" />
      <path d="M7 9.2c1.1 0 2.1.3 3 .8M17 9.2c-1.1 0-2.1.3-3 .8M7 12.2c1.1 0 2.1.3 3 .8M17 12.2c-1.1 0-2.1.3-3 .8" />
    </svg>
  )
}
