import Link from 'next/link'
import Image from 'next/image'
import { MwNav } from '../components/mw/mw-nav'
import { MwFooter } from '../components/mw/mw-footer'
import { FirefliesLayer } from '../components/mw/fireflies-layer'

export const metadata = {
  title: 'Our Story',
}

export default function OurStoryPage() {
  return (
    <div className="mw-page mw-page--story min-h-[100dvh]">
      <FirefliesLayer />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <MwNav variant="story" />
        <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center gap-8 px-6 pb-16 pt-12">
          {/* Opening */}
          <div className="flex w-full flex-col items-center gap-7 text-center">
            <div className="relative aspect-[16/10] w-full max-w-[640px] overflow-hidden rounded-[50%]">
              <Image
                src="/images/teahouse-team.png"
                alt="Tea being poured from a glass pitcher beside a fire"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <h1 className="mw-font-title text-[clamp(64px,10vw,120px)]">Our Story</h1>
            <p className="mw-font-body max-w-[600px] text-[21px] italic leading-[1.65] text-[var(--mw-text-strong)]">
              Welcome to the Midnight Teahouse — a dreamy little world created by friends for friends, with
              support from our talented and loving community.
            </p>
          </div>

          <hr className="my-2 h-px w-16 border-0" style={{ background: '#4A525C' }} />

          {/* First text block */}
          <div className="mw-font-body flex w-full max-w-[600px] flex-col gap-5 text-left text-[19px] leading-[1.75] text-[var(--mw-text)]">
            <h2 className="mw-font-aboreto text-[22px] tracking-[0.06em] text-[var(--mw-text-strong)]">
              What is the Midnight Teahouse?
            </h2>
            <p>
              We are cultivating a beloved gathering spot for ourselves, our community, and the beautiful
              strangers we meet along the way. This is a space to savor: where body and mind can be softened,
              senses delighted, imaginations set loose.
            </p>
            <p>
              For now, our teahouse is offered as a monthly pop-up: a curated evening of gongfu tea service,
              live music and cozy corners. It is a time and space carved out for rest, unfurling and gentle
              play.
            </p>
          </div>

          {/* Second text block */}
          <div className="mw-font-body flex w-full max-w-[600px] flex-col gap-5 text-left text-[19px] leading-[1.75] text-[var(--mw-text)]">
            <h2 className="mw-font-aboreto text-[22px] tracking-[0.06em] text-[var(--mw-text-strong)]">
              What&rsquo;s next?
            </h2>
            <p>
              Soon we hope to find a permanent home. A place where artists and musicians gather to play, where
              regulars come to unwind and new friends are always wandering in, hoping to be surprised.
            </p>
            <p>Thank you for being part of our unfolding. We are grateful to be building it with you.</p>
            <p className="italic text-[22px] text-[var(--mw-text-strong)]">
              With love,
              <br />
              Your Tea Keepers
            </p>
          </div>

          <Link href="/make-a-wish" className="mw-btn-primary mt-2">
            Join Our Gatherings
          </Link>
        </main>
        <MwFooter variant="story" />
      </div>
    </div>
  )
}
