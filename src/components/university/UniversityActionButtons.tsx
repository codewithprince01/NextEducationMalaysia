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
      ? 'bg-white rounded-2xl shadow-sm p-4 space-y-2.5 border border-gray-100'
      : 'bg-white rounded-2xl shadow-sm p-3.5 sm:p-4 flex flex-col gap-2.5 border border-gray-100'

  return (
    <div className={wrapClass}>
      {variant === 'mobile' && (
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Downloads & Services
        </h3>
      )}

      <button
        onClick={onBrochure}
        className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-sm hover:shadow-blue-200/50 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <Download size={17} />
        Download Brochure
      </button>

      <button
        onClick={onFeeStructure}
        className="w-full bg-white border border-blue-600/30 text-blue-700 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold border-dashed hover:border-solid hover:border-blue-600 cursor-pointer"
      >
        <FileText size={17} />
        Download Fee Structure
      </button>

      <button
        onClick={onCounselling}
        className="relative group w-full overflow-hidden bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-tight cursor-pointer"
      >
        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
        <BookOpen size={17} className="animate-bounce" />
        Direct University Counseling
      </button>

      <button
        onClick={onReview}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
      >
        <Edit3 size={15} />
        Write a Review
      </button>
    </div>
  )
}
