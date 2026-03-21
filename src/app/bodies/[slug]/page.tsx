import BodiesClient from './BodiesClient'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const name = slug
    .split('-')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
  return resolveStaticMetaAny(
    ['University Bodies', 'bodies'],
    `/bodies/${slug}`,
    `${name} | Education Malaysia`,
  )
}

export default function BodiesPage({ params }: Props) {
  return <BodiesClient />
}
