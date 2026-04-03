import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HeroVideo } from './components/hero-video'

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
    <div className="carrd-page min-h-[100dvh] text-[#e8e0d5] md:min-h-screen">
      {/* Top nav */}
      <nav className="mx-auto flex max-w-[780px] items-center justify-between border-b border-[rgba(232,224,213,0.12)] px-4 py-4 text-sm tracking-[0.12em] uppercase md:px-6 md:py-5">
        <Link
          href="/"
          className="font-serif text-lg font-light tracking-[0.12em] text-[#e8e0d5] md:text-xl"
        >
          Midnight Teahouse
        </Link>

        {/* Desktop nav */}
        <ul className="hidden list-none gap-8 md:flex">
          <li>
            <a
              href="#gatherings"
              className="text-[13px] tracking-[0.14em] text-[rgba(232,224,213,0.65)] transition-colors hover:text-[#e8e0d5] md:text-sm"
            >
              Gatherings
            </a>
          </li>
          <li>
            <a
              href="#private-events"
              className="text-[13px] tracking-[0.14em] text-[rgba(232,224,213,0.65)] transition-colors hover:text-[#e8e0d5] md:text-sm"
            >
              Private events
            </a>
          </li>
          <li>
            <a
              href="#our-story"
              className="text-[13px] tracking-[0.14em] text-[rgba(232,224,213,0.65)] transition-colors hover:text-[#e8e0d5] md:text-sm"
            >
              Our Story
            </a>
          </li>
        </ul>

        {/* Mobile nav */}
        <details className="relative md:hidden">
          <summary className="list-none cursor-pointer rounded-full border border-[rgba(232,224,213,0.25)] px-4 py-2.5 text-sm uppercase tracking-[0.16em] text-[rgba(232,224,213,0.95)]">
            Menu
          </summary>
          <div className="absolute right-0 z-20 mt-3 h-[30vh] w-56 rounded-2xl border border-[rgba(232,224,213,0.2)] bg-[#2E0303]/95 py-4 text-base shadow-xl backdrop-blur-sm">
            <a
              href="#gatherings"
              className="flex h-1/3 items-center px-5 text-[rgba(232,224,213,0.9)] hover:bg-[rgba(232,224,213,0.08)]"
            >
              Gatherings
            </a>
            <a
              href="#private-events"
              className="flex h-1/3 items-center px-5 text-[rgba(232,224,213,0.88)] hover:bg-[rgba(232,224,213,0.08)]"
            >
              Private events
            </a>
            <a
              href="#our-story"
              className="flex h-1/3 items-center px-5 text-[rgba(232,224,213,0.88)] hover:bg-[rgba(232,224,213,0.08)]"
            >
              Our Story
            </a>
          </div>
        </details>
      </nav>

      <main className="mx-auto max-w-[780px]">
        {/* Hero — object-contain video; tight margins on desktop, modest on mobile */}
        <section
          id="top"
          className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-b border-[rgba(232,224,213,0.1)] min-h-[52vh] md:min-h-[min(82vh,56.25vw)]"
        >
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#2E0303]">
            <div className="flex h-full w-full items-center justify-center px-[11%] py-[9%] md:px-[4%] md:py-[3%] lg:px-[2.5%] lg:py-[2.5%]">
              <HeroVideo className="max-h-full max-w-full object-contain object-center" />
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#2E0303]/40 via-[#2E0303]/20 to-[#2E0303]/45"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_75%_at_50%_40%,transparent_35%,rgba(46,3,3,0.35)_100%)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 py-12 md:py-16">
            <div className="pointer-events-auto w-full max-w-xl rounded-sm border border-[rgba(232,224,213,0.12)] bg-[rgba(20,8,8,0.55)] px-5 py-7 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-[6px] md:px-7 md:py-9">
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[rgba(248,242,232,0.95)] [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_0_20px_rgba(0,0,0,0.4)] md:text-sm">
                San Francisco · By reservation
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
                  href="/invite"
                  className="inline-flex items-center justify-center border border-[rgba(180,140,110,0.55)] bg-[rgba(46,3,3,0.55)] px-7 py-3 text-sm font-normal uppercase tracking-[0.1em] text-[#f5ead8] backdrop-blur-sm md:px-8 md:text-base"
                >
                  Reserve Your Seat
                </Link>
                <Link
                  href="/our-story"
                  className="inline-flex items-center justify-center border border-[rgba(232,224,213,0.4)] bg-[rgba(46,3,3,0.35)] px-7 py-3 text-sm font-normal uppercase tracking-[0.1em] text-[rgba(248,242,232,0.96)] backdrop-blur-sm md:px-8 md:text-base"
                >
                  Our story
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

        {/* Mailing list */}
        <section className="border-b border-[rgba(232,224,213,0.08)] flex flex-wrap items-center gap-9 px-6 py-11">
          <div className="min-w-[200px] flex-1">
            <h2 className="mb-2 font-serif text-[1.65rem] italic leading-tight text-[#f2ebe0] md:text-3xl">
              Stay in the loop
            </h2>
            <p className="text-base leading-8 text-[rgba(232,224,213,0.62)] md:text-lg md:leading-relaxed">
              New gatherings, behind-the-scenes notes, and the occasional love letter about tea.
            </p>
          </div>
          <form className="flex min-w-[220px] flex-1 items-center gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded border border-[rgba(180,140,110,0.35)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center border border-[rgba(180,140,110,0.45)] bg-[rgba(180,140,110,0.18)] px-5 py-2.5 text-sm font-normal uppercase tracking-[0.1em] text-[#e8d4b8]"
            >
              Join
            </button>
          </form>
        </section>

        {/* Private events teaser + inquiry */}
        <section
          id="private-events"
          className="border-b border-[rgba(232,224,213,0.08)] px-6 py-11"
        >
          <h2 className="mb-3 font-serif text-[1.65rem] font-light leading-tight text-[#f2ebe0] md:text-3xl">
            Bring us to your event
          </h2>
          <p className="mb-5 max-w-[32rem] text-base leading-8 text-[rgba(232,224,213,0.65)] md:text-lg md:leading-relaxed">
            We offer intimate tea service for weddings, corporate gatherings, and private parties —
            the full warmth of Midnight Teahouse, wherever you are.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(232,224,213,0.22)] px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] text-[rgba(232,224,213,0.55)] md:text-sm">
              Weddings
            </span>
            <span className="rounded-full border border-[rgba(232,224,213,0.22)] px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] text-[rgba(232,224,213,0.55)] md:text-sm">
              Corporate offsites
            </span>
            <span className="rounded-full border border-[rgba(232,224,213,0.22)] px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] text-[rgba(232,224,213,0.55)] md:text-sm">
              Private parties
            </span>
          </div>

          <p
            id="home-inquiry"
            className="mt-10 mb-6 text-center text-xs uppercase tracking-[0.18em] text-[rgba(200,175,140,0.55)] md:text-sm"
          >
            or tell us about your event
          </p>

          <div className="rounded border border-[rgba(180,140,110,0.25)] bg-[rgba(180,140,110,0.06)] p-7 md:p-8">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm">
                  Event type
                </label>
                <input
                  type="text"
                  placeholder="Wedding, corporate, party..."
                  className="rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm">
                  Date
                </label>
                <input
                  type="text"
                  placeholder="Approximate date"
                  className="rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
                />
              </div>
            </div>
            <textarea
              placeholder="Tell us a little about your event — guest count, location, vision..."
              className="mt-3 h-28 w-full resize-none rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base leading-relaxed text-[#d4b896] outline-none md:px-4"
            />
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center border border-[rgba(180,140,110,0.45)] bg-[rgba(180,140,110,0.18)] px-6 py-2.5 text-sm font-normal uppercase tracking-[0.1em] text-[#e8d4b8]"
            >
              Send inquiry
            </button>
          </div>
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
      </main>

      <footer className="mx-auto flex max-w-[780px] flex-wrap items-center justify-between gap-4 border-t border-[rgba(232,224,213,0.08)] px-6 py-7 text-xs uppercase tracking-[0.14em] text-[rgba(232,224,213,0.45)] md:text-sm">
        <div className="font-serif text-base italic text-[rgba(232,224,213,0.55)] md:text-lg">
          Midnight Teahouse
        </div>
        <div className="flex gap-5">
          <a href="https://instagram.com/midnight_teahouse" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://instagram.com/midnight_teahouse" target="_blank" rel="noreferrer">
            @midnight_teahouse
          </a>
          <a href="mailto:hello@midnighttea.house">Contact</a>
        </div>
      </footer>
    </div>
  )
}
