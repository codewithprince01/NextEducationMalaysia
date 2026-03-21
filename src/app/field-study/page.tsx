import FieldStudyClient from '@/components/home/FieldStudyClient'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['field-study', 'Field Study', 'top-study-area'],
    '/field-study',
    'Top Study Areas Preferred by International Students in Malaysia - EMGS Stats',
  )
}

export default function FieldStudyPage() {
  return (
    <main>
      <FieldStudyClient />
    </main>
  )
}
