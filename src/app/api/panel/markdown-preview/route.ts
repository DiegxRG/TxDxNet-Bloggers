import configPromise from '@payload-config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import { editorialEditor } from '@/editor'

export async function POST(request: Request) {
  const { html } = (await request.json()) as { html?: string }
  const payload = await getPayload({ config: configPromise })
  const editorConfig = await editorConfigFactory.fromEditor({
    config: payload.config,
    editor: editorialEditor,
    isRoot: true,
    parentIsLocalized: false,
  })

  const lexical = convertHTMLToLexical({
    editorConfig,
    html: html || '',
    JSDOM,
  })

  return Response.json({ lexical })
}
