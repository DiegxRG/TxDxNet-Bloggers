import type { Locale } from '@/lib/locale'

export type DomainCopy = {
  name: string
  shortName: string
  description: string
}

export type DomainItem = {
  id: string
  image?: string
  copy: Record<Locale, DomainCopy>
}

export const domains: DomainItem[] = [
  {
    id: '01',
    image: '/prompt1i.png',
    copy: {
      es: {
        name: 'Capital Humano',
        shortName: 'Vector Humano',
        description: 'La experiencia, identidad y cultura de seguridad de las personas.',
      },
      en: {
        name: 'Human Capital',
        shortName: 'Human Vector',
        description: 'The experience, identity and security culture of people.',
      },
    },
  },
  {
    id: '02',
    image: '/prompt2i.png',
    copy: {
      es: {
        name: 'Endpoints & Workplace',
        shortName: 'Frente Endpoint',
        description: 'El espacio digital desde el que cada usuario trabaja y se conecta.',
      },
      en: {
        name: 'Endpoints & Workplace',
        shortName: 'Endpoint Field',
        description: 'The digital space where every user works and connects.',
      },
    },
  },
  {
    id: '03',
    image: '/prompt3i.png',
    copy: {
      es: {
        name: 'Aplicaciones, APIs & Code',
        shortName: 'Superficie Apps & APIs',
        description: 'Software, integraciones y código observados desde su comportamiento real.',
      },
      en: {
        name: 'Applications, APIs & Code',
        shortName: 'Code & API Surface',
        description: 'Software, integrations and code observed through their real behavior.',
      },
    },
  },
  {
    id: '04',
    image: '/prompt4i.png',
    copy: {
      es: {
        name: 'Infraestructura de Cómputo',
        shortName: 'Núcleo de Cómputo',
        description: 'Servidores y capacidad de procesamiento detrás de la operación.',
      },
      en: {
        name: 'Compute Infrastructure',
        shortName: 'Compute Core',
        description: 'Servers and processing capacity behind the operation.',
      },
    },
  },
  {
    id: '05',
    image: '/prompt5i.png',
    copy: {
      es: {
        name: 'Cloud & SaaS',
        shortName: 'Malla SaaS',
        description: 'Servicios distribuidos, plataformas cloud y aplicaciones contratadas.',
      },
      en: {
        name: 'Cloud & SaaS Estate',
        shortName: 'SaaS Grid',
        description: 'Distributed services, cloud platforms and contracted applications.',
      },
    },
  },
  {
    id: '06',
    image: '/prompt6i.png',
    copy: {
      es: {
        name: 'Infraestructura de Red',
        shortName: 'Tejido de Red',
        description: 'Conectividad, rendimiento y disponibilidad de extremo a extremo.',
      },
      en: {
        name: 'Network Infrastructure',
        shortName: 'Network Fabric',
        description: 'End-to-end connectivity, performance and availability.',
      },
    },
  },
  {
    id: '07',
    image: '/prompt7i.png',
    copy: {
      es: {
        name: 'Perímetro de Seguridad',
        shortName: 'Escudo Perimetral',
        description: 'La frontera dinámica que inspecciona, controla y contiene amenazas.',
      },
      en: {
        name: 'Security Perimeter',
        shortName: 'Perimeter Shield',
        description: 'The dynamic frontier that inspects, controls and contains threats.',
      },
    },
  },
  {
    id: '08',
    image: '/prompt8i.png',
    copy: {
      es: {
        name: 'Servicios Externos / IPs Públicas',
        shortName: 'Exposición Externa',
        description: 'La huella expuesta de la organización vista desde Internet.',
      },
      en: {
        name: 'External Services / Public IPs',
        shortName: 'External Exposure',
        description: 'The exposed footprint of the organization as seen from the Internet.',
      },
    },
  },
  {
    id: '09',
    image: '/prompt9i.png',
    copy: {
      es: {
        name: 'OT / IoT',
        shortName: 'Malla OT · IoT',
        description: 'Tecnología operacional, sensores y activos conectados al mundo físico.',
      },
      en: {
        name: 'OT / IoT',
        shortName: 'OT · IoT Mesh',
        description: 'Operational technology, sensors and assets connected to the physical world.',
      },
    },
  },
  {
    id: '10',
    image: '/prompt10i.png',
    copy: {
      es: {
        name: 'Seguridad Física',
        shortName: 'Capa Física',
        description: 'Controles y señales que protegen espacios, activos y continuidad.',
      },
      en: {
        name: 'Physical Security',
        shortName: 'Physical Layer',
        description: 'Controls and signals that protect spaces, assets and continuity.',
      },
    },
  },
  {
    id: '11',
    image: '/prompt11i.png',
    copy: {
      es: {
        name: 'Agentic / AI Models',
        shortName: 'Sistemas Agénticos',
        description: 'Agentes y modelos de IA gobernados como una nueva superficie crítica.',
      },
      en: {
        name: 'Agentic / AI Models',
        shortName: 'Agentic Systems',
        description: 'Governed AI agents and models treated as a new critical surface.',
      },
    },
  },
]

export function getDomainCopy(domain: DomainItem, locale: Locale): DomainCopy {
  return domain.copy[locale]
}
