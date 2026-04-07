type Props = { params: Promise<{ slug: string; section: string }> }

export default async function Head({ params }: Props) {
  await params
  return null
}
