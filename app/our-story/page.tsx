import Link from 'next/link'
import Image from 'next/image'
import { SiteFooter } from '../components/site-footer'

export default function OurStoryPage() {
  return (
    <div className="carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8">
      <Link
        href="/"
        className="carrd-corner-link top-2 right-4 md:top-4 md:right-8 carrd-link carrd-link--muted text-sm whitespace-nowrap"
      >
        Join Our Gatherings
      </Link>
      <div className="w-full max-w-[60rem] flex flex-col items-center px-6 md:px-12 py-8 md:py-12 gap-8 flex-1">
          {/* Hero photo */}
          <div className="relative w-full flex flex-col items-center">
            <div className="w-full flex justify-center">
            <div className="our-story-frame relative w-full max-w-[39.2rem]">
              <Image
                src="/images/teahouse-team.png"
                alt="The Midnight Teahouse team gathered around a low tea table"
                width={1024}
                height={682}
                className="w-full h-auto object-cover object-center"
                priority
              />
            </div>
            </div>
          </div>

          {/* Story copy: text blocks in rectangle, photos between */}
          <div className="carrd-font-body-light our-story-body w-full max-w-[56rem] flex flex-col gap-8">
            {/* Text block 1 */}
            <div className="text-left">
              <h1 className="carrd-font-heading text-3xl md:text-4xl mb-6">
                Our Story
              </h1>
              <p>
                Welcome to the Midnight Teahouse — a dreamy little world created by friends for friends, with support from our talented and loving community.
              </p>
            </div>

            {/* What is the Midnight Teahouse? + Photo 1: text 60%, photo right */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="text-left w-full sm:w-[60%] min-w-0">
                <p className="our-story-subheading mt-6">What is the Midnight Teahouse?</p>
                <p>
                  We are cultivating a beloved gathering spot for ourselves, our community, and the beautiful strangers we meet along the way. This is a space to savor: where body and mind can be softened, senses delighted, imaginations set loose.
                </p>
                <p>
                  For now, our teahouse is offered as a monthly pop-up: a curated evening of gongfu tea service, live music and cozy corners. It is a time and space carved out for rest, unfurling and gentle play.
                </p>
              </div>
              <div className="our-story-frame w-full sm:w-[40%] max-w-[20rem] sm:max-w-none shrink-0">
                <Image
                  src="/images/our-story-tea-ceremony-1.png"
                  alt="Tea ceremony with vibrant pink and purple lighting, a person pouring tea"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* What's next? + Photo 2: photo left, text 60% */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="our-story-frame our-story-frame--alt w-full sm:w-[40%] max-w-[20rem] sm:max-w-none shrink-0 order-2 sm:order-1">
                <Image
                  src="/images/our-story-tea-ceremony-2.png"
                  alt="Two people smiling during a tea ceremony with purple and pink lighting"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="text-left w-full sm:w-[60%] min-w-0 order-1 sm:order-2">
                <p className="our-story-subheading">What&apos;s next?</p>
                <p>
                  Soon we hope to find a permanent home. A place where artists and musicians gather to play, where regulars come to unwind and new friends are always wandering in, hoping to be surprised.
                </p>
                <p>
                  Thank you for being part of our unfolding. We are grateful to be building it with you.
                </p>
              </div>
            </div>

            {/* Signature: right-aligned with text block above */}
            <div className="text-right mt-4">
              <p>With love,</p>
              <p>Your Tea Keepers</p>
            </div>
          </div>

          <Link
            href="/"
            className="carrd-btn px-8 py-3 mt-4 inline-block"
          >
            Join Our Gatherings
          </Link>
        </div>
      <SiteFooter />
    </div>
  )
}
