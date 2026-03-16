import BodiesClient from './BodiesClient'

export const metadata = {
  title: 'University Body Details | Education Malaysia',
  description: 'View detailed information about university bodies and institutions.',
}

export default function BodiesPage({ params }: { params: Promise<{ slug: string }> }) {
  return <BodiesClient />
}
