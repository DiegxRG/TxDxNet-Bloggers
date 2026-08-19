export type ServiceItem = {
  code: string
  name: string
  eyebrow: string
  description: string
  image?: string
}

export const coreServices: ServiceItem[] = [
  {
    code: 'ARQ',
    name: '@Architect',
    eyebrow: 'Diseñar',
    description: 'Arquitecturas digitales seguras, funcionales y alineadas con el negocio.',
    image: '/service1.png',
  },
  {
    code: 'DEV',
    name: '@Devnet',
    eyebrow: 'Automatizar',
    description: 'Redes programables y prácticas SecDevOps que aceleran la operación.',
    image: '/service2.png',
  },
  {
    code: 'CYB',
    name: '@CyberAuth',
    eyebrow: 'Proteger',
    description: 'Ciberseguridad automatizada con marcos, evidencia y respuesta integral.',
    image: '/service3.png',
  },
  {
    code: 'DEP',
    name: '@Deployment',
    eyebrow: 'Ejecutar',
    description: 'Implementación precisa de plataformas modernas, eficientes y resilientes.',
    image: '/service4.png',
  },
]

export const capabilities = [
  'Identidad, acceso y Zero Trust',
  'Observabilidad y experiencia de servicio',
  'Eventos y comportamiento',
  'Vulnerabilidades y exposición',
  'Protección de datos y privacidad',
  'Resiliencia, IR y mejora continua',
]
