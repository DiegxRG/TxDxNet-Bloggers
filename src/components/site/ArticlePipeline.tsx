import type { CSSProperties, ReactNode } from 'react'

export type ArticlePipelineStep = {
  detail: string
  href: string
  icon: ReactNode
  label: string
  tone?: string
  track: string
}

type Props = {
  description: string
  eyebrow: string
  result: string
  resultLabel: string
  steps: ArticlePipelineStep[]
  title: string
  variant: 'ecosystem' | 'share'
}

export function ArticlePipeline({ description, eyebrow, result, resultLabel, steps, title, variant }: Props) {
  return (
    <aside aria-label={title} className={`article-pipeline article-pipeline--${variant}`}>
      <div className="article-pipeline__header">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <i>LIVE</i>
      </div>
      <p className="article-pipeline__description">{description}</p>

      <div className="article-pipeline__track">
        {steps.map((step, index) => {
          const external = /^(https?:|mailto:)/i.test(step.href)

          return (
            <a
              className="article-pipeline__step"
              data-tone={step.tone}
              href={step.href}
              key={step.label}
              rel={external ? 'noreferrer' : undefined}
              style={{ '--pipeline-index': index } as CSSProperties}
              target={external && !step.href.startsWith('mailto:') ? '_blank' : undefined}
            >
              <span className="article-pipeline__node">{step.icon}</span>
              <span className="article-pipeline__step-copy">
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </span>
              <span className="article-pipeline__track-label">{step.track}</span>
            </a>
          )
        })}
      </div>

      <div className="article-pipeline__result">
        <span className="article-pipeline__result-dot" />
        <div>
          <strong>{result}</strong>
          <small>{resultLabel}</small>
        </div>
      </div>
    </aside>
  )
}
