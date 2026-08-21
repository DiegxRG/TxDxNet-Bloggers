import type { Payload } from 'payload'

type MetricPeriod = {
  articleReads: number
  label: string
  pageViews: number
  uniqueVisitors: number
}

type DailyPoint = {
  articleReads: number
  day: string
  pageViews: number
  visitors: number
}

const periods = [
  { days: 7, label: 'Últimos 7 días' },
  { days: 30, label: 'Últimos 30 días' },
  { days: 90, label: 'Últimos 90 días' },
]

const DAILY_WINDOW_DAYS = 30

function getFromDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function getLimaDay(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Lima',
    year: 'numeric',
  }).format(date)
}

function buildDailyWindow() {
  const days: string[] = []
  for (let offset = DAILY_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    days.push(getLimaDay(date))
  }
  return days
}

export async function getPrivateMetrics(payload: Payload) {
  const metricPeriods: MetricPeriod[] = await Promise.all(
    periods.map(async ({ days, label }) => {
      const createdAt = { greater_than_equal: getFromDate(days) }
      const [pageViews, articleReads, uniqueVisitors] = await Promise.all([
        payload.count({ collection: 'analytics-events', overrideAccess: true, where: { and: [{ type: { equals: 'page_view' } }, { createdAt }] } }),
        payload.count({ collection: 'analytics-events', overrideAccess: true, where: { and: [{ type: { equals: 'article_read' } }, { createdAt }] } }),
        payload.count({ collection: 'analytics-visitors', overrideAccess: true, where: { createdAt } }),
      ])

      return { articleReads: articleReads.totalDocs, label, pageViews: pageViews.totalDocs, uniqueVisitors: uniqueVisitors.totalDocs }
    }),
  )

  const topReads = await payload.find({
    collection: 'analytics-events',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: { path: true },
    sort: '-createdAt',
    where: {
      and: [
        { type: { equals: 'article_read' } },
        { createdAt: { greater_than_equal: getFromDate(90) } },
      ],
    },
  })

  const readsByPath = new Map<string, number>()
  for (const event of topReads.docs) {
    readsByPath.set(event.path, (readsByPath.get(event.path) || 0) + 1)
  }

  const dailyWindow = buildDailyWindow()
  const windowStart = getFromDate(DAILY_WINDOW_DAYS)
  const [dailyEvents, dailyVisitors] = await Promise.all([
    payload.find({
      collection: 'analytics-events',
      depth: 0,
      limit: 10000,
      overrideAccess: true,
      pagination: false,
      select: { day: true, type: true },
      sort: '-createdAt',
      where: {
        and: [
          { type: { in: ['page_view', 'article_read'] } },
          { createdAt: { greater_than_equal: windowStart } },
        ],
      },
    }),
    payload.find({
      collection: 'analytics-visitors',
      depth: 0,
      limit: 10000,
      overrideAccess: true,
      pagination: false,
      select: { day: true },
      sort: '-createdAt',
      where: { createdAt: { greater_than_equal: windowStart } },
    }),
  ])

  const dailyByDay = new Map<string, DailyPoint>(
    dailyWindow.map((day) => [day, { articleReads: 0, day, pageViews: 0, visitors: 0 }]),
  )
  for (const event of dailyEvents.docs) {
    const point = dailyByDay.get(event.day)
    if (!point) continue
    if (event.type === 'article_read') point.articleReads += 1
    else point.pageViews += 1
  }
  for (const visitor of dailyVisitors.docs) {
    const point = dailyByDay.get(visitor.day)
    if (point) point.visitors += 1
  }

  return {
    daily: dailyWindow.map((day) => dailyByDay.get(day)!),
    periods: metricPeriods,
    topArticles: [...readsByPath.entries()]
      .sort(([, first], [, second]) => second - first)
      .slice(0, 10)
      .map(([path, reads]) => ({ path, reads })),
  }
}
