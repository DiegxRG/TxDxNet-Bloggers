import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { ActionCard } from './blocks/ActionCard'
import { Callout } from './blocks/Callout'
import { MediaFeature } from './blocks/MediaFeature'
import { ComparisonTable } from './blocks/ComparisonTable'

export const editorialEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    EXPERIMENTAL_TableFeature(),
    FixedToolbarFeature(),
    BlocksFeature({
      blocks: [Callout, MediaFeature, ActionCard, ComparisonTable],
    }),
  ],
})
