import type { Metadata } from 'next'
import UnsubscribeClient from '@/components/newsletter/UnsubscribeClient'
import { verifyNewsletterUnsubscribeParams } from '@/lib/newsletter-unsubscribe'

export const metadata: Metadata = {
  title: 'Bülten Aboneliğini İptal Et',
  description: 'ÖzTelevi bülten aboneliğini güvenli şekilde iptal edin.',
  robots: {
    index: false,
    follow: false,
  },
}

interface UnsubscribePageProps {
  searchParams: Promise<{
    email?: string
    expires?: string
    signature?: string
  }>
}

export default async function NewsletterUnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const params = await searchParams
  const verification = verifyNewsletterUnsubscribeParams(params)

  const initialState = verification.ok
    ? 'valid'
    : verification.reason === 'expired'
      ? 'expired'
      : verification.reason === 'missing_secret'
        ? 'misconfigured'
        : 'invalid'

  return (
    <UnsubscribeClient
      email={params.email || ''}
      expires={params.expires || ''}
      signature={params.signature || ''}
      initialState={initialState}
    />
  )
}
