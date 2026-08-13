import type { Block } from 'payload'

export const MediaFeature: Block = {
  slug: 'mediaFeature',
  interfaceName: 'MediaFeatureBlock',
  labels: {
    singular: 'Imagen destacada',
    plural: 'Imágenes destacadas',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'wide',
      options: [
        { label: 'Ancho', value: 'wide' },
        { label: 'Contenido', value: 'content' },
        { label: 'Pantalla completa', value: 'full' },
      ],
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Leyenda',
    },
  ],
}
