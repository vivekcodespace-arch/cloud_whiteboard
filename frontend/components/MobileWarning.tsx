'use client'

export default function MobileWarning() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717] p-6 text-center text-white md:hidden">
      <div className="max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="mb-3 text-xl font-semibold">
          Desktop Recommended
        </h2>
        <p className="text-sm text-zinc-400">
          This application is not comfortable to use on small screens.
          Please switch to a tablet, laptop, or desktop for the best experience.
        </p>
      </div>
    </div>
  )
}