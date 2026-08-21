'use client'

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const NAVY = '#07142d'
const BLUE = '#0f4fc4'
const ORANGE = '#ff5a18'

const axisStyle = { fontSize: 11, fontWeight: 600 } as const

const tooltipStyle = {
  borderRadius: '0.9rem',
  border: '1px solid rgba(7,20,45,0.12)',
  boxShadow: '0 14px 40px rgba(7,20,45,0.12)',
  fontSize: 12,
  fontWeight: 600,
} as const

export type DailyPoint = {
  articleReads: number
  day: string
  pageViews: number
  visitors: number
}

export type PeriodPoint = {
  label: string
  articleReads: number
  pageViews: number
  uniqueVisitors: number
}

export type TopArticlePoint = {
  path: string
  reads: number
}

function formatDay(day: string) {
  const [, month, date] = day.split('-')
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${date} ${monthNames[Number(month) - 1]}`
}

function formatArticlePath(path: string) {
  return path.replace('/articulos/', '')
}

export function DailyActivityChart({ data }: { data: DailyPoint[] }) {
  const points = data.map((point) => ({ ...point, label: formatDay(point.day) }))

  return (
    <ResponsiveContainer height={240} width="100%">
      <ComposedChart data={points} margin={{ bottom: 0, left: -18, right: 6, top: 8 }}>
        <defs>
          <linearGradient id="visitsGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.28} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(7,20,45,0.1)" vertical={false} />
        <XAxis dataKey="label" minTickGap={28} stroke="rgba(7,20,45,0.35)" style={axisStyle} tickLine={false} />
        <YAxis allowDecimals={false} stroke="rgba(7,20,45,0.35)" style={axisStyle} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(7,20,45,0.2)' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        <Bar barSize={10} dataKey="visitors" fill={NAVY} fillOpacity={0.16} name="Visitantes" radius={[3, 3, 0, 0]} />
        <Area dataKey="pageViews" fill="url(#visitsGradient)" name="Visitas" stroke={BLUE} strokeWidth={2.5} type="monotone" />
        <Line dataKey="articleReads" dot={false} name="Lecturas" stroke={ORANGE} strokeWidth={2.5} type="monotone" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function PeriodComparisonChart({ data }: { data: PeriodPoint[] }) {
  return (
    <ResponsiveContainer height={220} width="100%">
      <BarChart data={data} margin={{ bottom: 0, left: -18, right: 6, top: 8 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(7,20,45,0.1)" vertical={false} />
        <XAxis dataKey="label" stroke="rgba(7,20,45,0.35)" style={axisStyle} tickLine={false} />
        <YAxis allowDecimals={false} stroke="rgba(7,20,45,0.35)" style={axisStyle} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(7,20,45,0.04)' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        <Bar dataKey="pageViews" fill={BLUE} name="Visitas" radius={[5, 5, 0, 0]} />
        <Bar dataKey="articleReads" fill={ORANGE} name="Lecturas" radius={[5, 5, 0, 0]} />
        <Bar dataKey="uniqueVisitors" fill={NAVY} name="Visitantes" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopArticlesChart({ data }: { data: TopArticlePoint[] }) {
  const points = [...data]
    .sort((first, second) => first.reads - second.reads)
    .map((point) => ({ ...point, label: formatArticlePath(point.path) }))

  return (
    <ResponsiveContainer height={Math.max(points.length * 38 + 40, 160)} width="100%">
      <BarChart data={points} layout="vertical" margin={{ bottom: 0, left: 8, right: 24, top: 4 }}>
        <CartesianGrid strokeDasharray="3 6" horizontal={false} stroke="rgba(7,20,45,0.1)" />
        <XAxis allowDecimals={false} stroke="rgba(7,20,45,0.35)" style={axisStyle} tickLine={false} type="number" />
        <YAxis
          dataKey="label"
          stroke="rgba(7,20,45,0.35)"
          style={{ ...axisStyle, fontSize: 10 }}
          tickFormatter={(value: string) => (value.length > 22 ? `${value.slice(0, 21)}…` : value)}
          tickLine={false}
          type="category"
          width={150}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(7,20,45,0.04)' }} />
        <Bar barSize={14} dataKey="reads" fill={BLUE} name="Lecturas" radius={[0, 5, 5, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
