'use client'

export default function ManagedPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 rounded-full bg-stone-200" />
          <div className="h-16 w-full max-w-3xl rounded-3xl bg-stone-200" />
          <div className="h-6 w-full max-w-2xl rounded-full bg-stone-100" />
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-8 w-48 rounded-full bg-stone-200" />
              <div className="h-5 w-full rounded-full bg-stone-100" />
              <div className="h-5 w-full rounded-full bg-stone-100" />
              <div className="h-5 w-5/6 rounded-full bg-stone-100" />
            </div>
            <div className="aspect-[4/5] rounded-3xl bg-stone-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
