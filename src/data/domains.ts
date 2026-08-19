export type DomainItem = {
  id: string
  name: string
  shortName: string
  description: string
  image?: string
}

export const domains: DomainItem[] = [
  {
    id: '01',
    name: 'Capital Humano',
    shortName: 'Personas',
    description: 'La experiencia, identidad y cultura de seguridad de las personas.',
    image: '/prompt1i.png',
  },
  {
    id: '02',
    name: 'Endpoints & Workplace',
    shortName: 'Workplace',
    description: 'El espacio digital desde el que cada usuario trabaja y se conecta.',
    image: '/prompt2i.png',
  },
  {
    id: '03',
    name: 'Aplicaciones, APIs & Code',
    shortName: 'Apps / APIs',
    description: 'Software, integraciones y código observados desde su comportamiento real.',
    image: '/prompt3i.png',
  },
  {
    id: '04',
    name: 'Infraestructura de Cómputo',
    shortName: 'Cómputo',
    description: 'Servidores y capacidad de procesamiento detrás de la operación.',
    image: '/prompt4i.png',
  },
  {
    id: '05',
    name: 'Cloud & SaaS',
    shortName: 'Cloud / SaaS',
    description: 'Servicios distribuidos, plataformas cloud y aplicaciones contratadas.',
    image: '/prompt5i.png',
  },
  {
    id: '06',
    name: 'Infraestructura de Red',
    shortName: 'Red',
    description: 'Conectividad, rendimiento y disponibilidad de extremo a extremo.',
    image: '/prompt6i.png',
  },
  {
    id: '07',
    name: 'Perímetro de Seguridad',
    shortName: 'Perímetro',
    description: 'La frontera dinámica que inspecciona, controla y contiene amenazas.',
    image: '/prompt7i.png',
  },
  {
    id: '08',
    name: 'Servicios Externos / IPs Públicas',
    shortName: 'Externos',
    description: 'La huella expuesta de la organización vista desde Internet.',
    image: '/prompt8i.png',
  },
  {
    id: '09',
    name: 'OT / IoT',
    shortName: 'OT / IoT',
    description: 'Tecnología operacional, sensores y activos conectados al mundo físico.',
    image: '/prompt9i.png',
  },
  {
    id: '10',
    name: 'Physical Security',
    shortName: 'Seguridad física',
    description: 'Controles y señales que protegen espacios, activos y continuidad.',
    image: '/prompt10i.png',
  },
  {
    id: '11',
    name: 'Agentic / AI Models',
    shortName: 'IA agéntica',
    description: 'Agentes y modelos de IA gobernados como una nueva superficie crítica.',
    image: '/prompt11i.png',
  },
]
