type Props = { params: Promise<{ type: string; pageSlug: string }> }

export default async function Head({ params }: Props) {
  await params
  return null
}
