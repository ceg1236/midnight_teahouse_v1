import Image from 'next/image'
import { MwNav } from '../components/mw/mw-nav'
import { MwFooter } from '../components/mw/mw-footer'
import { FirefliesLayer } from '../components/mw/fireflies-layer'
import { PrivateQuoteForm } from '../components/mw/private-quote-form'
import { HeroVideo } from '../components/hero-video'

export const metadata = {
  title: 'Private Events',
}

const INCLUDED = [
  {
    title: 'Hosted tea tables',
    description: 'Our team brews and pours gongfu-style for your guests throughout the event.',
    image: '/images/private-events-tea-service.jpg',
    alt: 'A guest smiling at a candlelit tea table set with cups and a gongfu tea tray',
  },
  {
    title: 'Curated tea menu',
    description: 'Teas and teaware from China and Taiwan, selected for your event.',
    image: '/images/private-events-tea-station.webp',
    alt: 'Outdoor tea station set up under string lights with glass teapots and warmers',
  },
  {
    title: 'Live music (optional)',
    description: 'Musicians from our community to set the mood.',
    image: '/images/private-events-musicians.jpg',
    alt: 'Musicians playing pipa and cello together by candlelight',
  },
]

const STEPS = [
  {
    number: '1',
    title: 'Request a quote',
    description: 'Tell us your date, location, budget and what you have in mind.',
  },
  {
    number: '2',
    title: 'Get a proposal',
    description: 'We reply with a plan and price for your event.',
  },
  {
    number: '3',
    title: 'We design the space together',
    description: 'We shape the lounge around your event, then set up and host on the day.',
  },
]

function IncludedPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border"
      style={{ borderColor: 'var(--mw-line-card)' }}
    >
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  )
}

export default function PrivateEventsPage() {
  return (
    <div className="mw-page mw-page--private min-h-[100dvh]">
      <FirefliesLayer />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <MwNav variant="private" />

        <main className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col gap-20 px-6 pb-20 pt-10 md:gap-24">
          {/* Hero */}
          <section className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <p className="mw-font-body text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--mw-gold)]">
                Private events &amp; catering
              </p>
              <h1 className="mw-font-aboreto text-[clamp(36px,4.6vw,58px)] leading-[1.12] tracking-[0.03em] text-[var(--mw-text-strong)]">
                A tea lounge for your event
              </h1>
              <p className="mw-font-body text-[20px] leading-[1.65] text-[var(--mw-text)]">
                We bring hosted gongfu tea service and a calm, beautiful tea lounge to weddings, birthdays,
                conferences, festivals and museums.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="#quote" className="mw-btn-primary">
                  Request a quote
                </a>
                <a
                  href="mailto:midnight.teahouse.sf@gmail.com?subject=Private%20event%20inquiry"
                  className="mw-btn-secondary"
                >
                  Email us
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
              <HeroVideo wrapperClassName="absolute inset-0" className="h-full w-full object-cover" />
            </div>
          </section>

          {/* Event-type strip */}
          <section
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 border-y px-4 py-6 text-center"
            style={{ borderColor: 'var(--mw-line)' }}
          >
            <p className="mw-font-aboreto text-[17px] leading-[1.8] tracking-[0.14em] text-[var(--mw-text-strong)]">
              Weddings{' '}
              <span className="mw-crescent" aria-hidden>
                {' '}
                ☽{' '}
              </span>{' '}
              Birthdays{' '}
              <span className="mw-crescent" aria-hidden>
                {' '}
                ☽{' '}
              </span>{' '}
              Conferences{' '}
              <span className="mw-crescent" aria-hidden>
                {' '}
                ☽{' '}
              </span>{' '}
              Festivals{' '}
              <span className="mw-crescent" aria-hidden>
                {' '}
                ☽{' '}
              </span>{' '}
              Museums
            </p>
          </section>

          {/* What's included */}
          <section className="flex flex-col gap-10">
            <h2 className="mw-font-aboreto text-center text-[26px] tracking-[0.06em] text-[var(--mw-text-strong)]">
              What&rsquo;s included
            </h2>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {INCLUDED.map((item) => (
                <div key={item.title} className="flex flex-col gap-4">
                  <IncludedPhoto src={item.image} alt={item.alt} />
                  <h3 className="mw-font-body text-[21px] font-bold text-[var(--mw-text-strong)]">{item.title}</h3>
                  <p className="mw-font-body text-[17px] leading-relaxed text-[var(--mw-text-soft)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section
            className="-mx-6 flex flex-col gap-10 px-6 py-14 md:mx-0 md:rounded-sm md:px-12"
            style={{ background: 'var(--mw-panel)' }}
          >
            <h2 className="mw-font-aboreto text-center text-[26px] tracking-[0.06em] text-[var(--mw-text-strong)]">
              How it works
            </h2>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col gap-3 text-center sm:text-left">
                  <span className="mw-font-aboreto text-[30px] text-[var(--mw-gold)]">{step.number}</span>
                  <h3 className="mw-font-body text-[19px] font-bold text-[var(--mw-text-strong)]">{step.title}</h3>
                  <p className="mw-font-body text-[17px] leading-relaxed text-[var(--mw-text-soft)]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Request a quote */}
          <section id="quote" className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="mw-font-aboreto text-[30px] tracking-[0.06em] text-[var(--mw-text-strong)]">
                Request a quote
              </h2>
              <p className="mw-font-body text-[18px] leading-relaxed text-[var(--mw-text)]">
                Share a few details and we&rsquo;ll get back to you with a proposal.
              </p>
              <p className="mw-font-body text-[17px] text-[var(--mw-text-muted)]">
                Rather write to us directly?{' '}
                <a
                  href="mailto:midnight.teahouse.sf@gmail.com?subject=Private%20event%20inquiry"
                  className="mw-link"
                >
                  midnight.teahouse.sf@gmail.com
                </a>
              </p>
            </div>
            <PrivateQuoteForm />
          </section>
        </main>

        <MwFooter variant="private" />
      </div>
    </div>
  )
}
