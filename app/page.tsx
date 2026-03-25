import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HeroVideo } from './components/hero-video'
import { SiteFooter } from './components/site-footer'

export const dynamic = 'force-dynamic'

function firstString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

/**
 * Marketing home. Full reservation flow lives at /invite.
 * Legacy ?ticket= and (dev) ?mock= on / redirect to /invite.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const ticket = firstString(params.ticket)
  const mock = firstString(params.mock)
  const qs = new URLSearchParams()
  if (ticket) qs.set('ticket', ticket)
  if (process.env.NODE_ENV === 'development' && mock) qs.set('mock', mock)
  if (qs.toString()) {
    redirect(`/invite?${qs.toString()}`)
  }

  return (
    <div className="carrd-page flex min-h-[100dvh] flex-col items-center px-6 pt-24 pb-12 md:min-h-screen md:pt-28">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-10 text-center">
        <div>
          <p className="font-cursive text-xl text-[#C4AF86]/90 mb-4">✶</p>
          <h1 className="carrd-font-heading text-3xl md:text-4xl [font-variant:small-caps] text-[#FAEBD4] tracking-wide">
            Midnight Teahouse
          </h1>
          <p className="carrd-font-subtitle mt-3 text-sm italic text-[#D9D0BF]/90">
            an enchanted world hidden in San Francisco
          </p>
        </div>

        <div className="carrd-video-fade w-full max-w-[650px] overflow-hidden py-2">
          <div className="aspect-video overflow-hidden rounded-lg">
            <HeroVideo className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="carrd-font-body space-y-4 text-lg leading-relaxed text-[#FAEBD4]">
          <p>
            We host curated evenings of gongfu tea, live music, and good company — a monthly pop-up
            while we grow toward a permanent home.
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/invite" className="carrd-btn px-8 py-4 text-center text-lg">
            Tickets &amp; reservations
          </Link>
          <Link
            href="/our-story"
            className="inline-flex items-center justify-center rounded-lg border border-[#FAE0B9]/50 px-8 py-4 text-lg text-[#FAEBD4] transition-colors hover:border-[#FAE0B9] hover:bg-[#FAE0B9]/10"
          >
            Our story
          </Link>
        </div>
      </div>

      <SiteFooter variant="main" className="mt-auto pt-16" />
    </div>
  )
}
