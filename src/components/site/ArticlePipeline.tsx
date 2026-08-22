import type { CSSProperties, ReactNode } from 'react'

import { PipelineActionButton } from './PipelineActionButton'

export type ArticlePipelineStep = {
  action?: 'copy' | 'share'
  detail: string
  href?: string
  icon: ReactNode
  label: string
  tone?: string
  track: string
}

type Props = {
  copiedMessage: string
  copyManuallyMessage: string
  description: string
  eyebrow: string
  result: string
  resultLabel: string
  sharedMessage: string
  shareText?: string
  shareURL?: string
  steps: ArticlePipelineStep[]
  title: string
  variant: 'ecosystem' | 'share'
}

export function ArticlePipeline({ copiedMessage, copyManuallyMessage, description, eyebrow, result, resultLabel, sharedMessage, shareText, shareURL, steps, title, variant }: Props) {
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
          const style = { '--pipeline-index': index } as CSSProperties

          if (step.action && shareURL) {
            return (
              <PipelineActionButton
                action={step.action}
                className="article-pipeline__step"
                copiedMessage={copiedMessage}
                copyManuallyMessage={copyManuallyMessage}
                detail={step.detail}
                icon={step.icon}
                key={step.label}
                label={step.label}
                sharedMessage={sharedMessage}
                shareText={shareText}
                style={style}
                tone={step.tone}
                track={step.track}
                url={shareURL}
              />
            )
          }

          const external = /^(https?:|mailto:)/i.test(step.href ?? '')

          return (
            <a
              className="article-pipeline__step"
              data-tone={step.tone}
              href={step.href}
              key={step.label}
              rel={external ? 'noreferrer' : undefined}
              style={style}
              target={external && !step.href?.startsWith('mailto:') ? '_blank' : undefined}
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
