import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Equipo',
  description: 'Conoce al equipo editorial de TxDxSecure.',
  alternates: { canonical: '/equipo' },
}

export default function ServicesRedirect() {
  redirect('/equipo')
}
