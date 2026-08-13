import type { ReactNode } from 'react'

type DomainIconProps = {
  className?: string
  domainId: string
}

const icons: Record<string, ReactNode> = {
  '01': (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3.5 20c.6-3.7 2.3-5.5 5.5-5.5s4.9 1.8 5.5 5.5M14.2 15.2c.8-.7 1.8-1 2.9-1 2.6 0 4 1.5 4.4 4.4" />
    </>
  ),
  '02': (
    <>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2.5 19h19M9 16l-1 3M15 16l1 3" />
    </>
  ),
  '03': (
    <>
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M14 5l-4 14" />
    </>
  ),
  '04': (
    <>
      <rect x="4" y="4" width="16" height="5" rx="1" />
      <rect x="4" y="10" width="16" height="5" rx="1" />
      <rect x="4" y="16" width="16" height="4" rx="1" />
      <path d="M7 6.5h.01M7 12.5h.01M7 18h.01M10 6.5h7M10 12.5h7M10 18h7" />
    </>
  ),
  '05': (
    <>
      <path d="M6.8 18.5a4.3 4.3 0 0 1-.2-8.6A6.1 6.1 0 0 1 18.3 12a3.3 3.3 0 0 1-.7 6.5Z" />
    </>
  ),
  '06': (
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <circle cx="12" cy="13" r="2.5" />
      <path d="m12 7v3.5M10 14.5l-3.5 2M14 14.5l3.5 2" />
    </>
  ),
  '07': (
    <>
      <path d="M12 3.5 20 7v5.2c0 4.4-2.7 7.3-8 8.8-5.3-1.5-8-4.4-8-8.8V7Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  '08': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5M12 3.5C9.7 5.9 8.5 8.7 8.5 12s1.2 6.1 3.5 8.5" />
    </>
  ),
  '09': (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13M12 14v6" />
    </>
  ),
  '10': (
    <>
      <path d="M4 8.5h4l1.5-2h5l1.5 2h4v10H4Z" />
      <circle cx="12" cy="13.5" r="3.2" />
      <path d="M18 6.5v-2M16.5 5h3" />
    </>
  ),
  '11': (
    <>
      <rect x="5" y="7" width="14" height="12" rx="3" />
      <path d="M12 3v4M9 12h.01M15 12h.01M9 16h6M3 11v4M21 11v4" />
    </>
  ),
}

export function DomainIcon({ className, domainId }: DomainIconProps) {
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
      {icons[domainId] || icons['07']}
    </svg>
  )
}
