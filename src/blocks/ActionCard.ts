import type { Block } from 'payload'

export const ActionCard: Block = {
  slug: 'actionCard',
  interfaceName: 'ActionCardBlock',
  labels: {
    singular: 'Llamado a la acción',
    plural: 'Llamados a la acción',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Descripción',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Texto del botón',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Destino',
          required: true,
        },
      ],
    },
  ],
}
