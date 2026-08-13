export type DomainItem = {
  id: string
  name: string
  shortName: string
  description: string
}

export const domains: DomainItem[] = [
  {
    id: '01',
    name: 'Capital Humano',
    shortName: 'Personas',
    description: 'La experiencia, identidad y cultura de seguridad de las personas.',
  },
  {
    id: '02',
    name: 'Endpoints & Workplace',
    shortName: 'Workplace',
    description: 'El espacio digital desde el que cada usuario trabaja y se conecta.',
  },
  {
    id: '03',
    name: 'Aplicaciones, APIs & Code',
    shortName: 'Apps / APIs',
    description: 'Software, integraciones y código observados desde su comportamiento real.',
  },
  {
    id: '04',
    name: 'Infraestructura de Cómputo',
    shortName: 'Cómputo',
    description: 'Servidores y capacidad de procesamiento detrás de la operación.',
  },
  {
    id: '05',
    name: 'Cloud & SaaS',
    shortName: 'Cloud / SaaS',
    description: 'Servicios distribuidos, plataformas cloud y aplicaciones contratadas.',
  },
  {
    id: '06',
    name: 'Infraestructura de Red',
    shortName: 'Red',
    description: 'Conectividad, rendimiento y disponibilidad de extremo a extremo.',
  },
  {
    id: '07',
    name: 'Perímetro de Seguridad',
    shortName: 'Perímetro',
    description: 'La frontera dinámica que inspecciona, controla y contiene amenazas.',
  },
  {
    id: '08',
    name: 'Servicios Externos / IPs Públicas',
    shortName: 'Externos',
    description: 'La huella expuesta de la organización vista desde Internet.',
  },
  {
    id: '09',
    name: 'OT / IoT',
    shortName: 'OT / IoT',
    description: 'Tecnología operacional, sensores y activos conectados al mundo físico.',
  },
  {
    id: '10',
    name: 'Physical Security',
    shortName: 'Seguridad física',
    description: 'Controles y señales que protegen espacios, activos y continuidad.',
  },
  {
    id: '11',
    name: 'Agentic / AI Models',
    shortName: 'IA agéntica',
    description: 'Agentes y modelos de IA gobernados como una nueva superficie crítica.',
  },
]
