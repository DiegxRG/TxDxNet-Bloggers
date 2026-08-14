import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { ActionCard } from './blocks/ActionCard'
import { Callout } from './blocks/Callout'
import { MediaFeature } from './blocks/MediaFeature'

export const editorialEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    BlocksFeature({
      blocks: [Callout, MediaFeature, ActionCard],
    }),
  ],
})
