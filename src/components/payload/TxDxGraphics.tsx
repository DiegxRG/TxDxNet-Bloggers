const imageStyle = {
  background: '#ffffff',
  display: 'block',
  objectFit: 'contain' as const,
}

export function TxDxAdminIcon() {
  return (
    <span
      style={{
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 0 0 1px rgba(127, 127, 127, 0.22)',
        display: 'inline-flex',
        height: 34,
        overflow: 'hidden',
        width: 34,
      }}
    >
      {/* Payload graphics are rendered inside its own client boundary. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="TxDxSecure" height="34" src="/logotxdx.png" style={imageStyle} width="34" />
    </span>
  )
}

export function TxDxAdminLogo() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
      <span
        style={{
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 0 0 1px rgba(127, 127, 127, 0.22)',
          display: 'inline-flex',
          height: 72,
          overflow: 'hidden',
          width: 72,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" height="72" src="/logotxdx.png" style={imageStyle} width="72" />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <strong style={{ fontSize: 24, letterSpacing: '-0.04em' }}>TxDxNet</strong>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            marginTop: 8,
            opacity: 0.62,
            textTransform: 'uppercase',
          }}
        >
          Powered by TxDxSecure
        </span>
      </span>
    </div>
  )
}
