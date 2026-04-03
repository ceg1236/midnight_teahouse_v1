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
      <nav className="mx-auto flex max-w-[780px] items-center justify-between border-b border-[rgba(232,224,213,0.12)] px-4 py-4 text-xs tracking-[0.14em] uppercase md:px-6 md:py-5">
        <Link
          href="/"
          className="font-serif text-base font-light tracking-[0.12em] text-[#e8e0d5]"
        >
          Midnight Teahouse
        </Link>

        {/* Desktop nav */}
        <ul className="hidden list-none gap-7 md:flex">
          <li>
            <a href="#top" className="text-[11px] tracking-[0.14em] text-[#e8e0d5]">
              Home
            </a>
          </li>
          <li>
            <a
              href="#gatherings"
              className="text-[11px] tracking-[0.14em] text-[rgba(232,224,213,0.5)] transition-colors hover:text-[#e8e0d5]"
            >
              Gatherings
            </a>
          </li>
          <li>
            <a
              href="#private-events"
              className="text-[11px] tracking-[0.14em] text-[rgba(232,224,213,0.5)] transition-colors hover:text-[#e8e0d5]"
            >
              Private events
            </a>
          </li>
          <li>
            <a
              href="#our-story"
              className="text-[11px] tracking-[0.14em] text-[rgba(232,224,213,0.5)] transition-colors hover:text-[#e8e0d5]"
            >
              Our Story
            </a>
          </li>
        </ul>

        {/* Mobile nav */}
        <details className="relative md:hidden">
          <summary className="list-none cursor-pointer rounded-full border border-[rgba(232,224,213,0.25)] px-4 py-2 text-[12px] uppercase tracking-[0.18em] text-[rgba(232,224,213,0.9)]">
            Menu
          </summary>
          <div className="absolute right-0 z-20 mt-3 h-[30vh] w-56 rounded-2xl border border-[rgba(232,224,213,0.2)] bg-[#2E0303]/95 py-4 text-[14px] shadow-xl backdrop-blur-sm">
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
        {/* Hero — video ~70% scale (proper ratio); copy on a light scrim for legibility */}
        <section
          id="top"
          className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-b border-[rgba(232,224,213,0.1)] min-h-[48vh] md:min-h-[min(68vh,39.375vw)]"
        >
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#2E0303]">
            {/* Inset ~15% each side ≈ 70% linear size while keeping aspect ratio */}
            <div className="flex h-full w-full items-center justify-center px-[15%] py-[14%] md:px-[18%] md:py-[16%]">
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
          <div className="relative z-10 mx-auto max-w-[780px] px-6 pb-12 pt-14 md:pb-14 md:pt-20">
            <div className="max-w-xl rounded-sm border border-[rgba(232,224,213,0.12)] bg-[rgba(20,8,8,0.55)] px-5 py-7 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-[6px] md:px-7 md:py-9">
              <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-[rgba(248,242,232,0.92)] [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_0_20px_rgba(0,0,0,0.4)] md:text-xs">
                San Francisco · By reservation
              </p>
              <h1 className="mb-5 max-w-[18ch] font-serif text-[2.75rem] font-light italic leading-[1.08] text-[#faf6ef] [text-shadow:0_2px_4px_rgba(0,0,0,0.9),0_0_28px_rgba(0,0,0,0.55)] md:mb-6 md:text-[4rem] md:leading-[1.06]">
                an enchanted world
                <br />
                hidden in the city
              </h1>
              <p className="mb-8 max-w-[28rem] text-base leading-relaxed text-[rgba(248,242,232,0.95)] [text-shadow:0_1px_3px_rgba(0,0,0,0.88)] md:text-lg md:leading-8">
                We host intimate, curated gatherings around gong-fu tea, live music and gentle, creative
                play.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/invite"
                  className="inline-flex items-center justify-center border border-[rgba(180,140,110,0.55)] bg-[rgba(46,3,3,0.55)] px-7 py-2.5 text-xs font-normal uppercase tracking-[0.1em] text-[#f5ead8] backdrop-blur-sm md:px-8 md:text-[13px]"
                >
                  Reserve Your Seat
                </Link>
                <Link
                  href="/our-story"
                  className="inline-flex items-center justify-center border border-[rgba(232,224,213,0.4)] bg-[rgba(46,3,3,0.35)] px-7 py-2.5 text-xs font-normal uppercase tracking-[0.1em] text-[rgba(248,242,232,0.96)] backdrop-blur-sm md:px-8 md:text-[13px]"
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
          <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-[rgba(232,224,213,0.28)]">
            Upcoming gatherings
          </p>

          <div className="border-t border-[rgba(232,224,213,0.08)] py-4">
            <div className="flex items-start gap-5">
              <div className="min-w-[50px] text-center">
                <div className="text-[9px] uppercase tracking-[0.14em] text-[rgba(232,224,213,0.3)]">
                  Apr
                </div>
                <div className="font-serif text-[30px] font-light leading-none text-[#c9a87a]">
                  16
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1 font-serif text-[19px] font-normal text-[#f0e8dd]">
                  After Dark: Altered States
                </div>
                <div className="mb-2 text-xs text-[rgba(232,224,213,0.42)]">
                  6:30–9:30 pm · The Exploratorium · San Francisco
                </div>
                <span className="inline-block border border-[rgba(180,140,110,0.25)] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[rgba(180,140,110,0.7)]">
                  Tea Lounge
                </span>
              </div>
              <Link
                href="/invite"
                className="self-center whitespace-nowrap rounded border border-[rgba(180,140,110,0.35)] px-4 py-2 text-[11px] uppercase tracking-[0.1em] text-[#c9a87a]"
              >
                RSVP →
              </Link>
            </div>
          </div>

          <div className="border-t border-[rgba(232,224,213,0.08)] py-4">
            <div className="flex items-start gap-5">
              <div className="min-w-[50px] text-center">
                <div className="text-[9px] uppercase tracking-[0.14em] text-[rgba(232,224,213,0.3)]">
                  May
                </div>
                <div className="font-serif text-[30px] font-light leading-none text-[#c9a87a]">
                  23
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1 font-serif text-[19px] font-normal text-[#f0e8dd]">
                  The Sound Healing Symphony
                </div>
                <div className="mb-2 text-xs text-[rgba(232,224,213,0.42)]">
                  7 pm–2 am · Sebastopol
                </div>
                <span className="inline-block border border-[rgba(180,140,110,0.25)] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[rgba(180,140,110,0.7)]">
                  Tea Lounge
                </span>
              </div>
              <Link
                href="/invite"
                className="self-center whitespace-nowrap rounded border border-[rgba(180,140,110,0.35)] px-4 py-2 text-[11px] uppercase tracking-[0.1em] text-[#c9a87a]"
              >
                RSVP →
              </Link>
            </div>
          </div>
        </section>

        {/* Mailing list */}
        <section className="border-b border-[rgba(232,224,213,0.08)] flex flex-wrap items-center gap-9 px-6 py-11">
          <div className="min-w-[200px] flex-1">
            <h2 className="mb-1 font-serif text-[24px] italic text-[#f0e8dd]">
              Stay in the loop
            </h2>
            <p className="text-[13px] leading-7 text-[rgba(232,224,213,0.45)]">
              New gatherings, behind-the-scenes notes, and the occasional love letter about tea.
            </p>
          </div>
          <form className="flex min-w-[220px] flex-1 items-center gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.07)] px-3 py-2 text-[13px] text-[#c9a87a] outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center border border-[rgba(180,140,110,0.4)] bg-[rgba(180,140,110,0.15)] px-5 py-2 text-[11px] font-normal uppercase tracking-[0.1em] text-[#c9a87a]"
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
          <h2 className="mb-2 font-serif text-[24px] font-light text-[#f0e8dd]">
            Bring us to your event
          </h2>
          <p className="mb-5 max-w-[480px] text-[13px] leading-7 text-[rgba(232,224,213,0.48)]">
            We offer intimate tea service for weddings, corporate gatherings, and private parties —
            the full warmth of Midnight Teahouse, wherever you are.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(232,224,213,0.14)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-[rgba(232,224,213,0.38)]">
              Weddings
            </span>
            <span className="rounded-full border border-[rgba(232,224,213,0.14)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-[rgba(232,224,213,0.38)]">
              Corporate offsites
            </span>
            <span className="rounded-full border border-[rgba(232,224,213,0.14)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-[rgba(232,224,213,0.38)]">
              Private parties
            </span>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded border border-[rgba(180,140,110,0.2)] bg-[rgba(180,140,110,0.05)] p-5 text-center">
              <div className="mb-2 text-[18px] text-[#c9a87a]">◷</div>
              <div className="mb-3 text-[12px] leading-6 text-[rgba(201,168,122,0.5)]">
                Book a 15-minute call and we&apos;ll figure out the details together.
              </div>
              <a
                href="#"
                className="inline-block rounded border border-[rgba(180,140,110,0.4)] bg-[rgba(180,140,110,0.15)] px-4 py-2 text-[10px] uppercase tracking-[0.1em] text-[#c9a87a]"
              >
                Schedule a call
              </a>
            </div>
            <div className="rounded border border-[rgba(180,140,110,0.2)] bg-[rgba(180,140,110,0.05)] p-5 text-center">
              <div className="mb-2 text-[18px] text-[#c9a87a]">✉</div>
              <div className="mb-3 text-[12px] leading-6 text-[rgba(201,168,122,0.5)]">
                Prefer to write? Send us a note and we&apos;ll follow up soon.
              </div>
              <a
                href="mailto:hello@midnighttea.house"
                className="inline-block rounded border border-[rgba(180,140,110,0.25)] bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.1em] text-[rgba(201,168,122,0.6)]"
              >
                Send an email
              </a>
            </div>
            <div className="rounded border border-[rgba(180,140,110,0.2)] bg-[rgba(180,140,110,0.05)] p-5 text-center">
              <div className="mb-2 text-[18px] text-[#c9a87a]">✦</div>
              <div className="mb-3 text-[12px] leading-6 text-[rgba(201,168,122,0.5)]">
                Share a few details and we&apos;ll reach out with a quote.
              </div>
              <a
                href="#home-inquiry"
                className="inline-block rounded border border-[rgba(180,140,110,0.25)] bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.1em] text-[rgba(201,168,122,0.6)]"
              >
                Fill out the form
              </a>
            </div>
          </div>

          <p
            id="home-inquiry"
            className="mt-8 mb-6 text-center text-[10px] uppercase tracking-[0.2em] text-[rgba(180,140,110,0.25)]"
          >
            or tell us about your event
          </p>

          <div className="rounded border border-[rgba(180,140,110,0.2)] bg-[rgba(180,140,110,0.06)] p-7">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.16em] text-[rgba(180,140,110,0.45)]">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="rounded border border-[rgba(180,140,110,0.25)] bg-[rgba(180,140,110,0.08)] px-3 py-2 text-[13px] text-[#c9a87a] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.16em] text-[rgba(180,140,110,0.45)]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="rounded border border-[rgba(180,140,110,0.25)] bg-[rgba(180,140,110,0.08)] px-3 py-2 text-[13px] text-[#c9a87a] outline-none"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.16em] text-[rgba(180,140,110,0.45)]">
                  Event type
                </label>
                <input
                  type="text"
                  placeholder="Wedding, corporate, party..."
                  className="rounded border border-[rgba(180,140,110,0.25)] bg-[rgba(180,140,110,0.08)] px-3 py-2 text-[13px] text-[#c9a87a] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.16em] text-[rgba(180,140,110,0.45)]">
                  Date
                </label>
                <input
                  type="text"
                  placeholder="Approximate date"
                  className="rounded border border-[rgba(180,140,110,0.25)] bg-[rgba(180,140,110,0.08)] px-3 py-2 text-[13px] text-[#c9a87a] outline-none"
                />
              </div>
            </div>
            <textarea
              placeholder="Tell us a little about your event — guest count, location, vision..."
              className="mt-3 h-24 w-full resize-none rounded border border-[rgba(180,140,110,0.25)] bg-[rgba(180,140,110,0.08)] px-3 py-2 text-[13px] text-[#c9a87a] outline-none"
            />
            <button
              type="button"
              className="mt-3 inline-flex items-center justify-center border border-[rgba(180,140,110,0.4)] bg-[rgba(180,140,110,0.15)] px-5 py-2 text-[11px] font-normal uppercase tracking-[0.1em] text-[#c9a87a]"
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
          <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-[rgba(232,224,213,0.28)]">
            Our story
          </p>
          <p className="mb-3 max-w-[500px] text-[13px] leading-7 text-[rgba(232,224,213,0.48)]">
            A dreamy little world created by friends for friends, with support from a talented and
            loving community.
          </p>
          <p className="max-w-[500px] text-[13px] leading-7 text-[rgba(232,224,213,0.48)]">
            For now, our teahouse is offered as a monthly pop-up: a curated gathering of gong-fu tea
            service, live music, and quiet corners. A time and space carved out for rest, unfurling,
            and gentle play.
          </p>
          <div className="mt-5">
            <Link
              href="/our-story"
              className="inline-flex items-center justify-center border border-[rgba(232,224,213,0.18)] bg-transparent px-6 py-2 text-[11px] font-normal uppercase tracking-[0.1em] text-[rgba(232,224,213,0.7)]"
            >
              Read the full story
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[780px] flex-wrap items-center justify-between gap-4 border-t border-[rgba(232,224,213,0.08)] px-6 py-7 text-[10px] uppercase tracking-[0.14em] text-[rgba(232,224,213,0.22)]">
        <div className="font-serif text-sm italic text-[rgba(232,224,213,0.3)]">
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
