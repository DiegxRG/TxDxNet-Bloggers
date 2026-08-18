type ServiceIconProps = {
  code: 'ARQ' | 'DEV' | 'CYB' | 'DEP'
}

export function ServiceIcon({ code }: ServiceIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      {code === 'ARQ' ? (
        <>
          <path d="m4 10 8-6 8 6v9H4z" />
          <path d="M8 19v-5h8v5M6 10h12" />
        </>
      ) : code === 'DEV' ? (
        <>
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
        </>
      ) : code === 'CYB' ? (
        <>
          <path d="M12 3 20 7v5c0 4.4-2.7 7.4-8 9-5.3-1.6-8-4.6-8-9V7z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </>
      ) : (
        <>
          <path d="M5 18 19 4M14 4h5v5M5 20h14" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="7" r="2" />
        </>
      )}
    </svg>
  )
}
