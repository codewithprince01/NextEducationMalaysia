import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, Globe, BookOpen, Users, Award, Building2, CheckCircle, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['study-in-malaysia', 'Study in Malaysia', 'team-education-malaysia'],
    '/study-in-malaysia',
    'Study in Malaysia - Complete Guide for International Students',
  )
}

const HIGHLIGHTS = [
  { icon: GraduationCap, label: '300+', desc: 'Universities & Colleges' },
  { icon: Globe, label: '185+', desc: 'Countries Represented' },
  { icon: BookOpen, label: '100K+', desc: 'International Students' },
  { icon: Award, label: '#38', desc: 'QS Asia Ranking' },
  { icon: Users, label: '98%', desc: 'Visa Approval Rate' },
  { icon: Building2, label: '2015', desc: 'Established Since' },
]

const SECTIONS = [
  {
    title: 'World-Class Education',
    content: 'Malaysia houses branch campuses of globally renowned universities including Monash University, University of Nottingham, Heriot-Watt University, and Curtin University. Students get internationally accredited degrees at a fraction of the cost.',
  },
  {
    title: 'Affordable Living Costs',
    content: 'Malaysia offers one of the most affordable living standards in Asia. Monthly expenses for a student range from USD 300–500, covering accommodation, food, and transport.',
  },
  {
    title: 'Safe & Welcoming',
    content: 'Malaysia is consistently ranked among the safest countries in Asia. Its multicultural society ensures that students from any background feel welcomed and at home.',
  },
  {
    title: 'English Medium Instruction',
    content: 'Most courses in Malaysia\'s public and private universities are delivered in English, making it the ideal destination for students seeking an English-medium education.',
  },
]

export default function StudyInMalaysiaPage() {
  return (
    <div className="bg-white min-h-screen">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Study in Malaysia' }
      ]} />

      {/* Hero */}
      <div className="bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-blue-200 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Official Student Guide 2025
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight uppercase">
              Study in <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-cyan-200">Malaysia</span>
            </h1>
            <p className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Join a global community of scholars in one of Asia&apos;s most dynamic and affordable education hubs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link href="/universities" className="bg-white text-blue-900 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all hover:scale-105 shadow-xl shadow-black/20">
                Search Universities
              </Link>
              <Link href="/contact-us" className="bg-blue-600 text-white border-2 border-blue-400/50 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all hover:scale-105">
                Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="group relative">
              <div className="absolute inset-0 bg-blue-600 rounded-3xl translate-y-2 opacity-0 group-hover:opacity-10 transition-all" />
              <div className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center hover:-translate-y-2 transition-all">
                <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <h.icon size={24} />
                </div>
                <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{h.label}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-6 uppercase tracking-tight">The Best of <span className="text-blue-600">Both Worlds</span></h2>
              <p className="text-slate-600 leading-relaxed text-lg">Malaysia offers a unique blend of high-quality education and a vibrant, multicultural lifestyle. Whether you&apos;re looking for a world-class degree or an unforgettable adventure, Malaysia has it all.</p>
            </div>
            <div className="space-y-4">
              {['Global Academic Recognition', 'Multicultural Living Environment', 'Strategic Asian Hub Location', 'Affordable Excellence'].map(t => (
                <div key={t} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="font-bold text-slate-800 text-sm uppercase tracking-wide">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-video rounded-4xl overflow-hidden shadow-2xl">
            <Image src="/images/study-hero.jpg" alt="Study in Malaysia" fill className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-10">
              <div className="text-white">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2 text-blue-300">Experience Excellence</p>
                <h3 className="text-2xl font-black leading-tight">Your Journey to Success Starts Here</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {SECTIONS.map((s) => (
            <div key={s.title} className="p-8 rounded-4xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
              <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{s.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tight">Ready to Take the <span className="text-blue-500">First Step?</span></h2>
            <p className="text-slate-400 text-lg mb-12">Our counselors are ready to help you find the perfect university and guide you through the entire application process.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact-us" className="bg-blue-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
                Apply Now <ArrowRight size={18} />
              </Link>
              <Link href="/resources/services" className="bg-white/10 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all border border-white/10">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
