import { Download, FileText, BookOpen, Edit3 } from 'lucide-react'

type Props = {
  onBrochure?: () => void
  onFeeStructure?: () => void
  onCounselling?: () => void
  onReview?: () => void
  variant?: 'mobile' | 'desktop'
}

export default function UniversityActionButtons({
  onBrochure,
  onFeeStructure,
  onCounselling,
  onReview,
  variant = 'desktop',
}: Props) {
  const wrapClass =
    variant === 'mobile'
      ? 'bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-gray-100'
      : 'bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-gray-100'

  return (
    <div className={wrapClass}>
      {variant === 'mobile' && (
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          Downloads & Services
        </h3>
      )}

      <button
        onClick={onBrochure}
        className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-lg hover:shadow-blue-200/50 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <Download size={18} />
        Download Brochure
      </button>

      <button
        onClick={onFeeStructure}
        className="w-full bg-white border-2 border-blue-600/20 text-blue-700 px-5 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm font-bold border-dashed hover:border-solid hover:border-blue-600 cursor-pointer"
      >
        <FileText size={18} />
        Download Fee Structure
      </button>

      <button
        onClick={onCounselling}
        className="relative group w-full overflow-hidden bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-5 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-tight cursor-pointer"
      >
        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
        <BookOpen size={18} className="animate-bounce" />
        Direct University Counseling
      </button>

      <button
        onClick={onReview}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
      >
        <Edit3 size={16} />
        Write a Review
      </button>
    </div>
  )
}
