import Link from 'next/link'
import type { Payload } from 'payload'

type Props = {
  payload: Payload
}

const POINTS = [
  {
    title: 'Editor visual avanzado',
    desc: 'Crea y estructura contenido de forma profesional.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  },
  {
    title: 'SEO asistido por IA',
    desc: 'Optimiza cada artículo para mejor posicionamiento.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  },
  {
    title: 'Versionado y control',
    desc: 'Historial completo y control de publicaciones.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  },
  {
    title: 'Publicación segura',
    desc: 'Flujos de aprobación y roles personalizados.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  },
  {
    title: 'Análisis de rendimiento',
    desc: 'Mide el impacto de tu contenido en tiempo real.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M9 9l3 3 3-3 6 6" />
  }
]

export default function BeforeLogin({ payload }: Props) {
  const siteURL = payload.config.serverURL

  return (
    <div className="txdx-login-panel">
      <Link href={siteURL} className="txdx-login-panel__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="txdx-login-panel__logo" alt="TxDxSecure" src="/logotxdx.png" />
        <span>
          <span className="txdx-login-panel__word">TxDxNet</span>
          <span className="txdx-login-panel__tag">EDITORIAL HUB</span>
        </span>
      </Link>

      <div className="txdx-login-panel__content">
        <h1 className="txdx-login-panel__title">
          Centro Editorial<br/><em>Inteligente</em>
        </h1>
        <p className="txdx-login-panel__lead">
          Publica contenido con impacto.
        </p>
        <ul className="txdx-login-panel__points">
          {POINTS.map((point) => (
            <li className="txdx-login-panel__point" key={point.title}>
              <div className="txdx-login-panel__icon">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  {point.icon}
                </svg>
              </div>
              <div>
                <strong>{point.title}</strong>
                <span>{point.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="txdx-login-panel__foot">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>
          <strong>Plataforma segura y confiable</strong>
          Protegemos tu conocimiento.
        </span>
      </div>
    </div>
  )
}
