import Link from 'next/link'
import { Users, Heart, Sparkles, Handshake, ArrowRight, MessageSquare } from 'lucide-react'
import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About Us | Education Malaysia',
  description: 'Discover the team and the story behind Education Malaysia, and learn why thousands of students choose us for their educational journey.',
  alternates: { canonical: `${SITE_URL}/resources/about` },
}

const sections = [
  { title: 'Who We Are', description: 'Learn about the mission, vision, and the values that drive Education Malaysia to support international students.', icon: Users, path: '/who-we-are', colorClass: 'bg-gradient-to-br from-blue-500 to-blue-700', delay: 100 },
  { title: 'Why Study in Malaysia?', description: 'Discover why Malaysia is becoming a top global destination for high-quality, affordable higher education.', icon: Sparkles, path: '/why-study-in-malaysia', colorClass: 'bg-gradient-to-br from-indigo-500 to-indigo-700', delay: 200 },
  { title: 'What Students Say', description: 'Read testimonials from thousands of students who have realized their academic dreams with our help.', icon: MessageSquare, path: '/what-people-say', colorClass: 'bg-gradient-to-br from-purple-500 to-purple-700', delay: 300 },
  { title: 'Our Partners', description: 'We work with top-tier universities and organizations worldwide to provide you with the best opportunities.', icon: Handshake, path: '/view-our-partners', colorClass: 'bg-gradient-to-br from-rose-500 to-pink-600', delay: 400 },
]

export default function AboutListingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white border-b border-gray-50">
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-linear-to-r from-blue-50/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm mb-6 uppercase tracking-wider">
              Get To Know Us
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
              About <span className="text-blue-600 font-extrabold">Us</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We are committed to providing international students with the most comprehensive and up-to-date information for their higher education in Malaysia.
            </p>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-12 gap-8">
            {sections.map((item, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-4xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl ${item.colorClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-50`}>
                  <item.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-8">{item.description}</p>
                <Link href={item.path} className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all group/btn">
                  Learn More
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
