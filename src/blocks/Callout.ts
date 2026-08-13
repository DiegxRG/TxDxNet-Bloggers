import type { Block } from 'payload'

export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: {
    singular: 'Aviso técnico',
    plural: 'Avisos técnicos',
  },
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'insight',
      options: [
        { label: 'Insight', value: 'insight' },
        { label: 'Seguridad', value: 'security' },
        { label: 'Advertencia', value: 'warning' },
        { label: 'Resultado', value: 'result' },
      ],
      required: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Antetítulo',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Contenido',
      required: true,
    },
  ],
}
