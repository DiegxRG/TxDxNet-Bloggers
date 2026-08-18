import type { Block } from 'payload'

export const ComparisonTable: Block = {
  slug: 'comparisonTable',
  interfaceName: 'ComparisonTableBlock',
  labels: {
    singular: 'Cuadro comparativo',
    plural: 'Cuadros comparativos',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Descripción o leyenda',
    },
    {
      name: 'headers',
      type: 'json',
      label: 'Encabezados (JSON)',
      required: true,
      admin: {
        description: 'Array de textos, por ejemplo: ["Opción A", "Opción B"].',
      },
    },
    {
      name: 'rows',
      type: 'json',
      label: 'Filas (JSON)',
      required: true,
      admin: {
        description: 'Array de objetos { label, cells }, donde cells es un array de textos.',
      },
    },
  ],
}
