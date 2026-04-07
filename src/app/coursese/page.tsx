import { redirect } from 'next/navigation'

// Redirect alias — mark noindex to prevent duplicate URL indexing
export const metadata = { robots: { index: false, follow: false } }

export default function CoursesAliasPage() {
  redirect('/courses')
}


