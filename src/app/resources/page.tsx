import Link from 'next/link'
import {
  BookOpen,
  Globe,
  FileText,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import Breadcrumb from '@/components/Breadcrumb'

export async function generateMetadata() {
  return resolveStaticMetaAny(['resources', 'Resources'], '/resources', 'Resources Hub | Education Malaysia')
}

const sections = [
  {
    title: "Exams",
    icon: BookOpen,
    colorClass: "bg-linear-to-br from-blue-500 to-indigo-600",
    items: [
      { label: "MUET", path: "/resources/exams/muet" },
      { label: "PTE Academic", path: "/resources/exams/pte" },
      { label: "TOEFL iBT", path: "/resources/exams/toefl" },
      { label: "IELTS", path: "/resources/exams/ielts" },
      { label: "View All Exams", path: "/resources/exams" },
    ],
    link: "/resources/exams",
  },
  {
    title: "Services",
    icon: Globe,
    colorClass: "bg-linear-to-br from-emerald-500 to-teal-600",
    items: [
      { label: "Discover Malaysia", path: "/resources/services/discover-malaysia" },
      { label: "Admission Guidance", path: "/resources/services/admission-guidance" },
      { label: "Visa Guidance", path: "/resources/services/visa-guidance" },
      { label: "Our Services", path: "/resources/services" },
    ],
    link: "/resources/services",
  },
  {
    title: "Guidelines",
    icon: FileText,
    colorClass: "bg-linear-to-br from-amber-500 to-orange-600",
    items: [
      { label: "Graduate Pass", path: "/resources/guidelines/graduate-pass" },
      { label: "MQA Standards", path: "/resources/guidelines/mqa" },
      { label: "Study in Malaysia", path: "/resources/guidelines/team-education-malaysia" },
      { label: "Student Guidelines", path: "/resources/guidelines" },
    ],
    link: "/resources/guidelines",
  },
  {
    title: "About Us",
    icon: Users,
    colorClass: "bg-linear-to-br from-rose-500 to-pink-600",
    items: [
      { label: "Who We Are", path: "/who-we-are" },
      { label: "What Students Say", path: "/what-people-say" },
      { label: "Why Study In Malaysia?", path: "/why-study" },
      { label: "Our Partners", path: "/view-our-partners" },
    ],
    link: "/resources/about",
  },
]

export default function ResourcesHubPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Resources' }
      ]} />
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm mb-6">
              <Sparkles size={16} className="mr-2" />
              Your Success Starts Here
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
              Resources <span className="text-blue-600">Hub</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              Everything you need to navigate your academic journey in Malaysia.
              From exam preparation to clinical guidance, we&apos;ve got you covered.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact-us"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
              >
                Need Help? Contact Us
              </Link>
              <Link
                href="/universities"
                className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Browse Universities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <Link href={section.link} className="block group/title">
                  <div className={`w-16 h-16 rounded-2xl ${section.colorClass} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-50`}>
                    <section.icon size={32} className="text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {section.title}
                    <ChevronRight
                      size={20}
                      className="text-gray-300 group-hover/title:text-blue-600 group-hover/title:translate-x-1 transition-all"
                    />
                  </h2>
                </Link>

                <ul className="space-y-4">
                  {section.items.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.path}
                        className="flex items-center text-gray-600 hover:text-blue-600 font-medium group/link transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-100 group-hover/link:bg-blue-600 mr-3 transition-colors"></span>
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight
                          size={16}
                          className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-8">
                Ready to take the next step?
              </h2>
              <p className="text-blue-50 text-xl mb-12 max-w-2xl mx-auto">
                Join thousands of students who have successfully started their
                journey with Education Malaysia.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-xl"
              >
                Apply for Admission <ArrowRight className="ml-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
