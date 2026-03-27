import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invalid Link | Education Malaysia',
  description: 'This link is invalid. Please request a new one and try again.',
};

export default function InvalidLinkPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#f4f7ff]">
      <div className="w-full max-w-xl rounded-2xl border border-blue-100 bg-white shadow-sm p-8 text-center">
        <h1 className="text-3xl font-bold text-[#0f1f45] mb-3">This link is invalid</h1>
        <p className="text-[#52607a] mb-8">Please request a new one and try again.</p>
        <Link
          href="/account/password/reset"
          className="inline-flex items-center justify-center rounded-xl bg-[#1f5eff] px-6 py-3 font-semibold text-white hover:bg-[#1e40af] transition-colors"
        >
          Request New Reset Link
        </Link>
      </div>
    </div>
  );
}

