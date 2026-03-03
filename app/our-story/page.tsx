import Link from 'next/link'
import Image from 'next/image'
import { SiteFooter } from '../components/site-footer'

export default function OurStoryPage() {
  return (
    <div className="carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8">
      <div className="w-full max-w-[60rem] flex flex-col items-center px-6 md:px-12 py-8 md:py-12 gap-8 flex-1">
          {/* Hero photo */}
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

          {/* Story copy with photos interspersed */}
          <div className="carrd-font-body-light our-story-body w-full max-w-[56rem] text-left">
            <h1 className="carrd-font-heading text-3xl md:text-4xl mb-6">
              Our Story
            </h1>

            <p>
              Welcome to the Midnight Teahouse — a dreamy little world created by friends for friends, with support from our talented and loving community.
            </p>

            {/* Photo 1: float right, wiggly frame */}
            <div className="our-story-frame float-none sm:float-right w-full sm:w-[42%] max-w-[16rem] sm:ml-6 mb-6 mt-4 sm:mt-2 shrink-0">
              <Image
                src="/images/our-story-tea-ceremony-1.png"
                alt="Tea ceremony with vibrant pink and purple lighting, a person pouring tea"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>

            <p className="our-story-subheading mt-6">What is the Midnight Teahouse?</p>
            <p>
              We are cultivating a beloved gathering spot for ourselves, our community, and the beautiful strangers we meet along the way. This is a space to savor: where body and mind can be softened, senses delighted, imaginations set loose.
            </p>
            <p>
              For now, our teahouse is offered as a monthly pop-up: a curated evening of gongfu tea service, live music and cozy corners. It is a time and space carved out for rest, unfurling and gentle play.
            </p>

            {/* Photo 2: float left, wiggly frame (alt shape) */}
            <div className="our-story-frame our-story-frame--alt float-none sm:float-left w-full sm:w-[42%] max-w-[16rem] sm:mr-6 mb-6 mt-4 sm:mt-2 shrink-0">
              <Image
                src="/images/our-story-tea-ceremony-2.png"
                alt="Two people smiling during a tea ceremony with purple and pink lighting"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>

            <p className="our-story-subheading mt-6">What&apos;s next?</p>
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

            {/* Clear floats before RSVP button */}
            <div className="clear-both" />
          </div>

          <Link
            href="/"
            className="carrd-btn px-8 py-3 mt-4 inline-block"
          >
            RSVP
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
