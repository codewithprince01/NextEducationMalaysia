import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import { getAllServices } from '@/lib/queries/resources'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['services', 'Services', 'resources/services'],
    '/resources/services',
    'Services for International Students | Education Malaysia',
  )
}

const FALLBACK_SERVICES = [
  { id: 1, page_name: 'Discover Malaysia', uri: 'discover-malaysia' },
  { id: 2, page_name: 'Admission Guidance', uri: 'admission-guidance' },
  { id: 3, page_name: 'Visa Guidance', uri: 'visa-guidance' },
]

function resolveServiceHref(item: any) {
  const raw = String(item?.uri || item?.slug || '').trim()
  if (!raw) return '/resources/services'

  if (/^https?:\/\//i.test(raw)) return raw

  const clean = raw.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!clean) return '/resources/services'

  if (clean.startsWith('resources/')) return `/${clean}`
  if (clean.startsWith('services/')) return `/resources/${clean}`

  const encoded = clean.split('/').map(encodeURIComponent).join('/')
  return `/resources/services/${encoded}`
}

export default async function ServicesPage() {
  const servicesRaw = (await getAllServices()) as any[]
  const services = (servicesRaw?.length ? servicesRaw : FALLBACK_SERVICES).filter(
    (item) => (item?.uri || item?.slug) && item?.page_name,
  )

  return (
    <section className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-3">
          <span className="text-blue-600">What We Do</span>
        </h2>
        <p className="text-gray-700 text-center mb-10 max-w-3xl mx-auto">
          Having and managing a correct marketing strategy is crucial in a fast-moving market.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((item: any) => {
            const href = resolveServiceHref(item)
            return (
              <Link
                key={item.id ?? `${item.page_name}-${href}`}
                href={href}
                className="bg-gray-50 rounded-2xl shadow-md p-5 group hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center text-xl">
                    <Sparkles size={20} />
                  </div>
                  <ArrowRight className="text-orange-500 group-hover:text-orange-600 transition" />
                </div>
                <h3 className="text-gray-800 font-semibold text-base truncate group-hover:text-blue-600 transition">
                  {item.page_name}
                </h3>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
