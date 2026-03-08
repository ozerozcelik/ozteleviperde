import { ResetPasswordClient } from '@/components/auth/ResetPasswordClient'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams

  return <ResetPasswordClient token={params.token?.trim() || ''} />
}
