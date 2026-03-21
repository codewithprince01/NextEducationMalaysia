import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { getServiceBySlug } from '@/lib/queries/resources'
import { resolveServiceMeta } from '@/lib/seo/metadata'
import { serializeBigInt } from '@/lib/utils'
import ServiceDetailClient from './ServiceDetailClient'
import {
  AdmissionGuidancePage,
  DiscoverMalaysiaPage,
  VisaGuidancePage,
} from './SpecialServicePages'

interface Params {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service Details | Education Malaysia' }
  return resolveServiceMeta(service as any)
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params
  const data = await getServiceBySlug(slug)
  if (!data) notFound()

  const service = serializeBigInt(data) as any
  const title = service?.headline || service?.page_name || service?.title || 'Service Details'

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: 'Services', href: '/resources/services' },
          { label: title },
        ]}
      />
      {slug === 'discover-malaysia' ? (
        <DiscoverMalaysiaPage />
      ) : slug === 'admission-guidance' ? (
        <AdmissionGuidancePage />
      ) : slug === 'visa-guidance' ? (
        <VisaGuidancePage />
      ) : (
        <ServiceDetailClient service={service} slug={slug} />
      )}
    </div>
  )
}
