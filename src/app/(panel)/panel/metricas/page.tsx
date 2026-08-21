import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { isOwner } from '@/access'
import { DailyActivityChart, PeriodComparisonChart, TopArticlesChart } from '@/components/panel/MetricsCharts'
import { getPanelSession } from '@/modules/panel/server/session'
import { getPrivateMetrics } from '@/modules/analytics/server/metrics'

export default async function PanelMetricsPage() {
  const { payload, user } = await getPanelSession()
  if (!isOwner(user)) redirect('/panel')

  const metrics = await getPrivateMetrics(payload)
  const current = metrics.periods[1]

  return (
    <div className="grid content-start gap-6" id="contenido-panel">
      <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
        <div className="flex flex-col gap-3 border-b border-[var(--theme-elevation-150)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-blue-500)]">
              <IconShield /> Solo owners
            </p>
            <h2 className="mt-1.5 font-display text-[1.4rem] font-extrabold tracking-[-0.04em] text-[var(--txdx-navy)]">Rendimiento del sitio</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--theme-elevation-600)]">
              Lecturas y visitas agregadas. No almacenamos IP, correo ni datos personales del visitante.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[rgba(18,104,255,0.08)] px-3 py-1.5 text-xs font-extrabold text-[var(--color-blue-600)]">
            <IconClock /> Ventana principal: 30 días
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MetricCard icon={<IconEye />} label="Visitas de página" value={current.pageViews} />
          <MetricCard icon={<IconBookOpen />} label="Lecturas de artículos" value={current.articleReads} />
          <MetricCard icon={<IconUsers />} label="Visitantes aproximados" value={current.uniqueVisitors} />
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
        <div className="border-b border-[var(--theme-elevation-150)] pb-4">
          <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-blue-500)]">
            <IconTrendingUp /> Actividad diaria
          </p>
          <h2 className="mt-1.5 font-display text-[1.15rem] font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]">Tendencia de los últimos 30 días</h2>
        </div>
        <div className="mt-4">
          {metrics.daily.some((point) => point.pageViews || point.articleReads || point.visitors) ? (
            <DailyActivityChart data={metrics.daily} />
          ) : (
            <p className="rounded-xl border border-dashed border-[var(--theme-elevation-200)] p-6 text-center text-sm font-semibold text-[var(--theme-elevation-500)]">
              Aún no hay actividad registrada.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
          <h2 className="inline-flex items-center gap-2 font-display text-[1.15rem] font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[rgba(15,79,196,0.08)] text-[var(--color-blue-500)]">
              <IconBarChart />
            </span>
            Comparativa por periodo
          </h2>
          <div className="mt-4">
            <PeriodComparisonChart data={metrics.periods} />
          </div>
          <div className="mt-4 grid gap-2">
            {metrics.periods.map((period) => (
              <div className="flex items-center justify-between rounded-xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-4 py-2.5 text-sm" key={period.label}>
                <span className="font-extrabold uppercase tracking-[0.1em] text-[var(--theme-elevation-500)]">{period.label}</span>
                <span className="font-bold text-[var(--txdx-navy)]">
                  {period.pageViews} visitas · {period.articleReads} lecturas · {period.uniqueVisitors} visitantes
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
          <div className="border-b border-[var(--theme-elevation-150)] pb-4">
            <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[var(--txdx-orange)]">
              <IconTrophy /> Últimos 90 días
            </p>
            <h2 className="mt-1.5 font-display text-[1.15rem] font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]">Artículos más leídos</h2>
          </div>
          <div className="mt-4">
            {metrics.topArticles.length ? (
              <TopArticlesChart data={metrics.topArticles} />
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--theme-elevation-200)] p-6 text-center text-sm font-semibold text-[var(--theme-elevation-500)]">
                Aún no hay lecturas registradas.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[linear-gradient(135deg,#f8fafc,#f1f5f9)] p-4 shadow-inner">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">{label}</p>
        <span aria-hidden="true" className="grid h-8 w-8 flex-none place-items-center rounded-xl bg-white text-[var(--color-blue-500)] shadow-sm">
          {icon}
        </span>
      </div>
      <p className="mt-2 font-display text-[2rem] font-extrabold leading-none tracking-[-0.05em] text-[var(--txdx-navy)]">{value}</p>
    </div>
  )
}

type IconProps = { className?: string }

function IconBase({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" className={className ?? 'h-4 w-4'} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {children}
    </svg>
  )
}

function IconEye({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  )
}

function IconBookOpen({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </IconBase>
  )
}

function IconUsers({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  )
}

function IconClock({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </IconBase>
  )
}

function IconShield({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  )
}

function IconTrendingUp({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </IconBase>
  )
}

function IconBarChart({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </IconBase>
  )
}

function IconTrophy({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </IconBase>
  )
}
