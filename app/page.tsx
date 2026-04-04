import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HeroVideo } from './components/hero-video'
import { HomeNewsletterForm } from './components/home-newsletter-form'
import { HomeSiteHeader } from './components/home-site-header'
import { PrivateInquiryForm } from './components/private-inquiry-form'

export const dynamic = 'force-dynamic'

function firstString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

/**
 * Marketing home at /.
 * Full reservation flow lives at /invite.
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
    <div className="carrd-page min-h-[100dvh] text-[#e8e0d5] max-md:pt-[calc(4.25rem+env(safe-area-inset-top,0px))] md:min-h-screen md:pt-0">
      <HomeSiteHeader />
      <main className="mx-auto max-w-[780px]">
        {/* Hero — mobile: 16:9 video strip on top, copy below; md+: full-bleed video + centered overlay */}
        <section
          id="top"
          className="relative left-1/2 flex w-screen -translate-x-1/2 flex-col overflow-hidden border-b border-[rgba(232,224,213,0.1)] md:block md:min-h-[min(82vh,56.25vw)]"
        >
          <div className="relative aspect-video w-full shrink-0 bg-[#2E0303] md:absolute md:inset-0 md:aspect-auto md:min-h-0 md:shrink">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full md:flex md:items-center md:justify-center md:px-[4%] md:py-[3%] lg:px-[2.5%] lg:py-[2.5%]">
                <HeroVideo className="h-full w-full object-cover object-center md:max-h-full md:max-w-full md:object-contain" />
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#2E0303]/85 via-transparent to-transparent md:bg-gradient-to-b md:from-[#2E0303]/40 md:via-[#2E0303]/20 md:to-[#2E0303]/45"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] hidden bg-[radial-gradient(ellipse_90%_75%_at_50%_40%,transparent_35%,rgba(46,3,3,0.35)_100%)] md:block"
              aria-hidden
            />
          </div>
          <div className="relative z-10 px-6 py-8 md:pointer-events-none md:absolute md:inset-0 md:flex md:items-center md:justify-center md:py-16">
            <div className="pointer-events-auto w-full max-w-xl rounded-sm border border-[rgba(232,224,213,0.12)] bg-[rgba(20,8,8,0.72)] px-5 py-7 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-[6px] md:bg-[rgba(20,8,8,0.55)] md:px-7 md:py-9">
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[rgba(248,242,232,0.95)] [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_0_20px_rgba(0,0,0,0.4)] md:text-sm">
                San Francisco based Teahouse
              </p>
              <h1 className="mb-5 max-w-[18ch] font-serif text-[3rem] font-light italic leading-[1.08] text-[#faf6ef] [text-shadow:0_2px_4px_rgba(0,0,0,0.9),0_0_28px_rgba(0,0,0,0.55)] md:mb-6 md:text-[4.25rem] md:leading-[1.06]">
                an enchanted world
                <br />
                hidden in the city
              </h1>
              <p className="mb-8 max-w-[28rem] text-lg leading-relaxed text-[rgba(248,242,232,0.97)] [text-shadow:0_1px_3px_rgba(0,0,0,0.88)] md:text-xl md:leading-9">
                We host intimate, curated gatherings around gong-fu tea, live music and gentle, creative
                play.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#gatherings"
                  className="inline-flex items-center justify-center border border-[rgba(180,140,110,0.55)] bg-[rgba(46,3,3,0.55)] px-7 py-3 text-sm font-normal uppercase tracking-[0.1em] text-[#f5ead8] backdrop-blur-sm md:px-8 md:text-base"
                >
                  Reserve Your Seat
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming gatherings teaser */}
        <section
          id="gatherings"
          className="border-b border-[rgba(232,224,213,0.08)] px-6 py-10"
        >
          <h2 className="mb-8 font-sans text-sm font-light uppercase tracking-[0.2em] text-[rgba(232,224,213,0.55)] md:mb-9 md:text-base md:tracking-[0.18em]">
            Upcoming gatherings
          </h2>

          <div className="border-t border-[rgba(232,224,213,0.08)] py-5">
            <div className="flex items-start gap-5">
              <div className="min-w-[52px] text-center md:min-w-[56px]">
                <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(232,224,213,0.55)] md:text-xs">
                  Apr
                </div>
                <div className="font-serif text-[34px] font-light leading-none text-[#c9a87a] md:text-[38px]">
                  16
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1.5 font-serif text-[1.35rem] font-normal leading-snug text-[#f0e8dd] md:text-2xl">
                  After Dark: Altered States
                </div>
                <div className="mb-2 text-sm leading-relaxed text-[rgba(232,224,213,0.62)] md:text-base">
                  6:30–9:30 pm · The Exploratorium · San Francisco
                </div>
                <span className="inline-block border border-[rgba(180,140,110,0.35)] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[rgba(200,175,140,0.9)] md:text-xs">
                  Tea Lounge
                </span>
              </div>
              <Link
                href="/invite"
                className="self-center whitespace-nowrap rounded border border-[rgba(180,140,110,0.35)] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-[#d4b896] md:text-sm"
              >
                RSVP →
              </Link>
            </div>
          </div>

          <div className="border-t border-[rgba(232,224,213,0.08)] py-5">
            <div className="flex items-start gap-5">
              <div className="min-w-[52px] text-center md:min-w-[56px]">
                <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(232,224,213,0.55)] md:text-xs">
                  May
                </div>
                <div className="font-serif text-[34px] font-light leading-none text-[#c9a87a] md:text-[38px]">
                  23
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1.5 font-serif text-[1.35rem] font-normal leading-snug text-[#f0e8dd] md:text-2xl">
                  The Sound Healing Symphony
                </div>
                <div className="mb-2 text-sm leading-relaxed text-[rgba(232,224,213,0.62)] md:text-base">
                  7 pm–2 am · Sebastopol
                </div>
                <span className="inline-block border border-[rgba(180,140,110,0.35)] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[rgba(200,175,140,0.9)] md:text-xs">
                  Tea Lounge
                </span>
              </div>
              <Link
                href="/invite"
                className="self-center whitespace-nowrap rounded border border-[rgba(180,140,110,0.35)] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-[#d4b896] md:text-sm"
              >
                RSVP →
              </Link>
            </div>
          </div>
        </section>

        {/* Private events teaser + inquiry */}
        <section
          id="private-events"
          className="border-b border-[rgba(232,224,213,0.08)] px-6 py-11"
        >
          <h2 className="mb-6 font-sans text-sm font-light uppercase tracking-[0.2em] text-[rgba(232,224,213,0.55)] md:mb-7 md:text-base md:tracking-[0.18em]">
            Bring us to your event
          </h2>
          <p className="mb-5 max-w-[32rem] text-base leading-8 text-[rgba(232,224,213,0.65)] md:text-lg md:leading-relaxed">
            We offer intimate tea service for weddings, corporate gatherings, and private parties —
            the full warmth of Midnight Teahouse, wherever you are.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(232,224,213,0.22)] px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] text-[rgba(232,224,213,0.55)] md:text-sm">
              Private parties
            </span>
            <span className="rounded-full border border-[rgba(232,224,213,0.22)] px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] text-[rgba(232,224,213,0.55)] md:text-sm">
              Corporate offsites
            </span>
            <span className="rounded-full border border-[rgba(232,224,213,0.22)] px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] text-[rgba(232,224,213,0.55)] md:text-sm">
              Weddings
            </span>
          </div>

          <p
            id="home-inquiry"
            className="mt-10 mb-6 text-center text-md uppercase tracking-[0.18em] text-[rgba(200,175,140,0.55)] md:text-medium"
          >
            tell us about your event
          </p>

          <PrivateInquiryForm />
        </section>

        {/* Our story teaser */}
        <section
          id="our-story"
          className="border-b border-[rgba(232,224,213,0.08)] px-6 py-11"
        >
          <h2 className="mb-6 font-sans text-sm font-light uppercase tracking-[0.2em] text-[rgba(232,224,213,0.55)] md:mb-7 md:text-base md:tracking-[0.18em]">
            Our story
          </h2>
          <p className="mb-4 max-w-[32rem] text-base leading-8 text-[rgba(232,224,213,0.68)] md:text-lg md:leading-relaxed">
            A dreamy little world created by friends for friends, with support from a talented and
            loving community.
          </p>
          <p className="max-w-[32rem] text-base leading-8 text-[rgba(232,224,213,0.68)] md:text-lg md:leading-relaxed">
            For now, our teahouse is offered as a monthly pop-up: a curated gathering of gong-fu tea
            service, live music, and quiet corners. A time and space carved out for rest, unfurling,
            and gentle play.
          </p>
          <div className="mt-6">
            <Link
              href="/our-story"
              className="inline-flex items-center justify-center border border-[rgba(232,224,213,0.28)] bg-transparent px-6 py-2.5 text-sm font-normal uppercase tracking-[0.1em] text-[rgba(232,224,213,0.85)] md:text-base"
            >
              Read the full story
            </Link>
          </div>
        </section>

        {/* Mailing list — after Our story */}
        <section className="border-b border-[rgba(232,224,213,0.08)] flex flex-wrap items-center gap-9 px-6 py-11">
          <div className="min-w-[200px] flex-1">
            <h2 className="mb-2 font-serif text-[1.65rem] italic leading-tight text-[#f2ebe0] md:text-3xl">
              Stay in the loop
            </h2>
            <p className="text-base leading-8 text-[rgba(232,224,213,0.62)] md:text-lg md:leading-relaxed">
              New gatherings, behind-the-scenes notes, and the occasional love letter about tea.
            </p>
          </div>
          <HomeNewsletterForm />
        </section>
      </main>

      <footer className="mx-auto flex max-w-[780px] flex-wrap items-center justify-between gap-4 border-t border-[rgba(232,224,213,0.08)] px-6 py-7 text-xs uppercase tracking-[0.14em] text-[rgba(232,224,213,0.45)] md:text-sm">
        <div className="font-serif text-base italic text-[rgba(232,224,213,0.55)] md:text-lg">
          Midnight Teahouse
        </div>
        <div className="flex gap-5">
          <a href="https://instagram.com/midnight_teahouse" target="_blank" rel="noreferrer">
            @midnight_teahouse
          </a>
          <a href="mailto:midnight.teahouse.sf@gmail.com">Contact</a>
        </div>
      </footer>
    </div>
  )
}
