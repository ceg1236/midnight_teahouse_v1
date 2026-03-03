import Link from 'next/link'
import Image from 'next/image'
import { SiteFooter } from '../components/site-footer'

export default function OurStoryPage() {
  return (
    <>
      <div className="carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8">
        <div className="w-full max-w-[60rem] flex flex-col items-center px-6 md:px-12 py-8 md:py-12 gap-8">
          <div className="w-full flex flex-col gap-8 md:grid md:grid-cols-2 md:items-start md:gap-10">
            {/* Photo: centered with equal side margins on all screens */}
            <div className="w-full flex justify-center">
              <div className="relative w-full max-w-[56rem]">
                <Image
                  src="/images/teahouse-team.png"
                  alt="The Midnight Teahouse team gathered around a low tea table"
                  width={1024}
                  height={682}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>

            {/* Story copy */}
            <div className="carrd-font-body-light our-story-body space-y-4 w-full max-w-[56rem] text-left">
              <h1 className="carrd-font-heading text-3xl md:text-4xl">
                Our Story
              </h1>
              <p>
                Welcome to the Midnight Teahouse — a dreamy little world created by friends for friends, with support from our talented and loving community.
              </p>
              <p className="our-story-subheading">What is the Midnight Teahouse?</p>
              <p>
                We are cultivating a beloved gathering spot for ourselves, our community, and the beautiful strangers we meet along the way. This is a space to savor: where body and mind can be softened, senses delighted, imaginations set loose.
              </p>
              <p>
                For now, our teahouse is offered as a monthly pop-up: a curated evening of gongfu tea service, live music and cozy corners. It is a time and space carved out for rest, unfurling and gentle play.
              </p>
              <p className="our-story-subheading">What&apos;s next?</p>
              <p>
                Soon we hope to find a permanent home. A place where artists and musicians gather to play, where regulars come to unwind and new friends are always wandering in, hoping to be surprised.
              </p>
              <p>
                Thank you for being part of our unfolding. We are grateful to be building it with you.
              </p>
              <p>
                With love,
                <br />
                Your Tea Keepers
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="carrd-font-body text-xs md:text-sm tracking-[0.18em] uppercase text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors mt-2"
          >
            RSVP
          </Link>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}

