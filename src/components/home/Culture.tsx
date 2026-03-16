import {
  GraduationCap, Briefcase, Globe, MapPin,
  TrendingUp, Users, Award,
} from 'lucide-react'

const cards = [
  { icon: GraduationCap, bg: 'bg-blue-100', color: 'text-blue-600', title: 'Safe & Peaceful Environment', desc: "Malaysia is known for its political stability, low crime rates, and student-friendly cities, ensuring a secure and comfortable place to study and live." },
  { icon: TrendingUp, bg: 'bg-green-100', color: 'text-green-600', title: 'Post-Study Opportunities', desc: "Graduates can take advantage of Malaysia's post-study options, including stay-back pathways that support job searching, skill development, and professional employment." },
  { icon: Award, bg: 'bg-yellow-100', color: 'text-yellow-600', title: 'Pathways to Global Universities', desc: "Malaysia provides flexible credit-transfer routes to top universities in the UK, Australia, and Europe, enabling students to earn internationally recognised degrees at a lower cost." },
  { icon: Users, bg: 'bg-purple-100', color: 'text-purple-600', title: 'Modern Infrastructure', desc: "Universities are equipped with state-of-the-art facilities, digital learning platforms, research labs, and innovative teaching environments designed for future-ready education." },
  { icon: Briefcase, bg: 'bg-orange-100', color: 'text-orange-600', title: 'Affordable Quality of Life', desc: "With reasonably priced accommodation, transportation, food, and healthcare, students enjoy a high standard of living without excessive costs." },
  { icon: Globe, bg: 'bg-cyan-100', color: 'text-cyan-600', title: 'Supportive Student Services', desc: "Dedicated international student offices assist with visa processes, housing, orientation, and academic support, ensuring a smooth and successful education journey." },
]

const aboutRows = [
  { bg: 'bg-blue-100', color: 'text-blue-600', icon: Globe, label: 'Capital', value: 'Kuala Lumpur' },
  { bg: 'bg-purple-100', color: 'text-purple-600', icon: Users, label: 'Population', value: '34 Million' },
  { bg: 'bg-green-100', color: 'text-green-600', icon: GraduationCap, label: 'Language', value: 'Malay, English' },
  { bg: 'bg-orange-100', color: 'text-orange-600', icon: Award, label: 'Climate', value: 'Tropical, warm' },
]

const economyRows = [
  { bg: 'bg-emerald-100', color: 'text-emerald-600', icon: TrendingUp, label: 'Growth', value: '~5% annually' },
  { bg: 'bg-teal-100', color: 'text-teal-600', icon: Users, label: 'Unemployment', value: '3.0%' },
  { bg: 'bg-cyan-100', color: 'text-cyan-600', icon: Briefcase, label: 'Top Sectors', value: 'Tech, Healthcare' },
  { bg: 'bg-blue-100', color: 'text-blue-600', icon: MapPin, label: 'States', value: '13 States + 3 FT' },
]

// Server Component — all static data, no client JS needed
export default function Culture() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-2 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-6 leading-tight px-4">
              Where Knowledge Grows and Opportunities Thrive in Malaysia
            </h2>
            <p className="text-slate-600 text-base max-w-6xl mx-auto leading-relaxed px-4 text-justify">
              Discover Malaysia — a nation that blends academic excellence with real-world career pathways, offering students an affordable, innovative, and globally connected study experience.
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-6 sm:mb-12 px-2 sm:px-0">
            {cards.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="bg-white p-6 sm:p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.color}`} />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>

          {/* About Malaysia + Economy */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mx-2 sm:mx-0">
            <div className="p-2 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* About Malaysia */}
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">About Malaysia</h4>
                  </div>
                  <div className="space-y-3">
                    {aboutRows.map((row, i) => {
                      const Icon = row.icon
                      return (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                          <div className={`w-8 h-8 ${row.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${row.color}`} />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800 text-sm">{row.label}:</span>
                            <span className="text-gray-600 text-sm">{row.value}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Economy */}
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Economy & Industries</h4>
                  </div>
                  <div className="space-y-3">
                    {economyRows.map((row, i) => {
                      const Icon = row.icon
                      return (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                          <div className={`w-8 h-8 ${row.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${row.color}`} />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800 text-sm">{row.label}:</span>
                            <span className="text-gray-600 text-sm">{row.value}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
