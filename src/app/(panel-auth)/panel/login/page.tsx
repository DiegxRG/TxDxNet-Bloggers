import { LoginForm } from './LoginForm'

type Props = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function PanelLoginPage({ searchParams }: Props) {
  const params = await searchParams
  const redirectTo = params.redirect === '/panel' ? '/panel' : '/panel'

  return <LoginForm redirectTo={redirectTo} />
}
