import { resolveStaticMetaAny } from '@/lib/seo/metadata'

export default async function Head() {
  const meta = await resolveStaticMetaAny(
    ['universities', 'Top Universities in Malaysia', 'universities-in-malaysia'],
    '/universities',
    'Top Universities in Malaysia - Education Malaysia',
  )

  const title =
    typeof meta.title === 'string'
      ? meta.title
      : (meta.title as any)?.absolute || (meta.title as any)?.default || ''
  const description = typeof meta.description === 'string' ? meta.description : ''
  const keywords = Array.isArray(meta.keywords) ? meta.keywords.join(', ') : (meta.keywords || '')
  const canonical =
    typeof meta.alternates?.canonical === 'string'
      ? meta.alternates.canonical
      : String(meta.alternates?.canonical || '')
  const og = meta.openGraph || {}
  const ogTitle = typeof og.title === 'string' ? og.title : title
  const ogDescription = typeof og.description === 'string' ? og.description : description
  const ogUrl = typeof og.url === 'string' ? og.url : canonical
  const ogImage = Array.isArray(og.images) && og.images.length > 0
    ? (typeof og.images[0] === 'string' ? og.images[0] : String((og.images[0] as any)?.url || ''))
    : ''
  const twitter = meta.twitter || {}
  const twitterCard = typeof (twitter as any).card === 'string' ? (twitter as any).card : 'summary_large_image'
  const twitterTitle = typeof twitter.title === 'string' ? twitter.title : title
  const twitterDescription = typeof twitter.description === 'string' ? twitter.description : description
  const twitterImage = Array.isArray(twitter.images) && twitter.images.length > 0
    ? (typeof twitter.images[0] === 'string' ? twitter.images[0] : String((twitter.images[0] as any)?.url || ''))
    : ogImage

  return (
    <>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {keywords ? <meta name="keywords" content={String(keywords)} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {ogTitle ? <meta property="og:title" content={ogTitle} /> : null}
      {ogDescription ? <meta property="og:description" content={ogDescription} /> : null}
      {ogUrl ? <meta property="og:url" content={ogUrl} /> : null}
      <meta property="og:site_name" content="Education Malaysia" />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content={twitterCard} />
      {twitterTitle ? <meta name="twitter:title" content={twitterTitle} /> : null}
      {twitterDescription ? <meta name="twitter:description" content={twitterDescription} /> : null}
      {twitterImage ? <meta name="twitter:image" content={twitterImage} /> : null}
    </>
  )
}
