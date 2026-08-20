const imageStyle = {
  display: 'block',
  objectFit: 'contain' as const,
}

export function TxDxAdminIcon() {
  return (
    <span
      style={{
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
    <div className="login__brand" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
        <span
          style={{
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
          <strong style={{ fontSize: 24, letterSpacing: '-0.04em', color: '#fff' }}>TxDxSecure</strong>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              marginTop: 8,
              opacity: 0.62,
              textTransform: 'uppercase',
              color: '#fff',
            }}
          >
            Powered by TxDxSecure
          </span>
        </span>
      </div>
      <div style={{ marginTop: '2.5rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Bienvenido de nuevo</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
          Accede a tu cuenta para continuar gestionando contenido.
        </p>
      </div>
    </div>
  )
}
