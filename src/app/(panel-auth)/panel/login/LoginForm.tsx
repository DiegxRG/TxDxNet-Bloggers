'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { FormEvent } from 'react'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/panel/login', {
      body: JSON.stringify({
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
      }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    if (!response.ok) {
      setPending(false)
      const result = (await response.json().catch(() => null)) as { message?: string } | null
      setError(result?.message || 'El correo o la contraseña no son válidos.')
      return
    }

    const sessionResponse = await fetch('/api/admins/me', { credentials: 'include' })
    if (!sessionResponse.ok) {
      setPending(false)
      setError('El acceso fue validado, pero no se pudo establecer la sesión. Intenta nuevamente.')
      return
    }

    window.location.assign(redirectTo || '/panel')
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(135deg,#07142d,#10254f)] px-5 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(88,217,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(88,217,255,0.09)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(circle_at_center,#000_30%,transparent_85%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -bottom-80 h-[44rem] w-[44rem] rounded-full border border-[rgba(88,217,255,0.2)] shadow-[0_0_0_4rem_rgba(88,217,255,0.03),0_0_0_8rem_rgba(255,90,24,0.03)]" />

      <section className="relative w-full max-w-md rounded-[1.5rem] border border-white/12 bg-white/95 p-6 shadow-[0_30px_90px_rgba(2,8,24,0.35)] md:p-8">
        <div className="flex items-center gap-3">
          <span className="relative block h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="TxDxSecure" className="h-full w-full object-contain" src="/logotxdx.png" />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">TxDxSecure</p>
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-[var(--theme-elevation-500)]">Panel editorial</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[var(--txdx-orange)]">
            <IconShield /> Acceso privado
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.06em] text-[var(--txdx-navy)]">Entra a tu panel</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--theme-elevation-600)]">Gestiona artículos, biblioteca y tu perfil editorial desde un solo lugar.</p>
        </div>

        <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-bold text-[var(--txdx-navy)]">
            Correo editorial
            <span className="relative block">
              <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]">
                <IconMail />
              </span>
              <input autoComplete="email" className="min-h-11 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white pl-10 pr-3.5 text-sm font-normal outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]" name="email" required type="email" />
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[var(--txdx-navy)]">
            Contraseña
            <span className="relative block">
              <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]">
                <IconLock />
              </span>
              <input autoComplete="current-password" className="min-h-11 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white pl-10 pr-11 text-sm font-normal outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]" name="password" required type={showPassword ? 'text' : 'password'} />
              <button
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--theme-elevation-500)] transition hover:bg-[var(--theme-elevation-100)] hover:text-[var(--txdx-navy)]"
                onClick={() => setShowPassword((visible) => !visible)}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                type="button"
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </span>
          </label>
          {error ? <p className="rounded-xl border border-[rgba(255,90,24,0.18)] bg-[rgba(255,90,24,0.08)] px-3 py-2 text-sm text-[var(--txdx-orange)]">{error}</p> : null}
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--txdx-blue)] px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
            <IconLogIn />
            {pending ? 'Validando acceso...' : 'Entrar al panel'}
          </button>
        </form>

        <Link className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm font-extrabold text-[var(--txdx-navy)] transition hover:-translate-y-0.5 hover:border-[rgba(88,217,255,0.6)] hover:bg-[#f2fbff]" href="/">
          <IconGlobe />
          Ir al sitio público txdxnet.com
        </Link>
      </section>
    </main>
  )
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {children}
    </svg>
  )
}

function IconShield() {
  return (
    <IconBase>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  )
}

function IconMail() {
  return (
    <IconBase>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </IconBase>
  )
}

function IconLock() {
  return (
    <IconBase>
      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </IconBase>
  )
}

function IconEye() {
  return (
    <IconBase>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  )
}

function IconEyeOff() {
  return (
    <IconBase>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </IconBase>
  )
}

function IconLogIn() {
  return (
    <IconBase>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </IconBase>
  )
}

function IconGlobe() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </IconBase>
  )
}
