import Link from 'next/link'
import type { Payload } from 'payload'

type Props = {
  payload: Payload
}

const POINTS = [
  'Redacción en borradores con autoguardado',
  'Flujo editorial por roles: autor, editor y administrador',
  'Vista previa en vivo antes de publicar',
  'Etiquetado y SEO guiados paso a paso',
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
          <span className="txdx-login-panel__tag">Powered by TxDxSecure</span>
        </span>
      </Link>

      <div>
        <h1 className="txdx-login-panel__title">
          Ideas para operar <em>con más claridad</em>.
        </h1>
        <p className="txdx-login-panel__lead">
          El panel editorial de TxDxSecure para publicar conocimiento sobre
          seguridad, redes, observabilidad y experiencia digital.
        </p>
        <ul className="txdx-login-panel__points">
          {POINTS.map((point) => (
            <li className="txdx-login-panel__point" key={point}>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <p className="txdx-login-panel__foot">
        © {new Date().getFullYear()} TxDxSecure · Acceso restringido al equipo editorial
      </p>
    </div>
  )
}
