type ResourceIconProps = {
  type: 'support' | 'domains'
}

export function ResourceIcon({ type }: ResourceIconProps) {
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
      {type === 'support' ? (
        <>
          <path d="M5 4.5h10l4 4v11H5z" />
          <path d="M15 4.5v4h4M8 13h8M8 16h5" />
          <circle cx="17.5" cy="17.5" r="3" />
          <path d="m16.2 17.5.8.8 1.7-1.8" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="5" cy="6" r="2" />
          <circle cx="19" cy="6" r="2" />
          <circle cx="5" cy="18" r="2" />
          <circle cx="19" cy="18" r="2" />
          <path d="m10.4 10.6-3.8-3.2M13.6 10.6l3.8-3.2M10.4 13.4l-3.8 3.2M13.6 13.4l3.8 3.2" />
        </>
      )}
    </svg>
  )
}
