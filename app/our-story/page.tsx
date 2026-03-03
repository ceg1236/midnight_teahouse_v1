import Link from 'next/link'

export default function OurStoryPage() {
  return (
    <div className="carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8">
      <div className="w-full max-w-[60rem] flex flex-col items-center px-6 md:px-12 py-8 md:py-12 gap-6">
        <h1 className="carrd-font-heading text-3xl md:text-4xl text-center">
          Our Story
        </h1>
        <div className="carrd-font-body-light space-y-4 w-full max-w-[56rem] text-left leading-relaxed">
          <p>
            Welcome to the Midnight Teahouse — a little world being created in San Francisco, born from our shared love of tea, music, community, and beautiful spaces.
          </p>
          <p className="font-medium carrd-font-body">What is Midnight Teahouse?</p>
          <p>
            Our vision is to cultivate a place that becomes both a beloved gathering spot and an inviting home for creative exploration — for ourselves, our community, and the beautiful strangers we meet along the way. We imagine a space to savor: where our body and mind can be softened, our senses delighted. For now, that takes the shape of a curated evening by reservation, with gongfu-style tea service, live music, and quiet corners.
          </p>
          <p className="font-medium carrd-font-body">What&apos;s next?</p>
          <p>
            Eventually, we hope to find a permanent home. We&apos;d love to become a place where artists and musicians gather to play, where friends stop by after a long day or wander in on a quiet Friday looking for adventure.
          </p>
        </div>
        <Link href="/" className="carrd-btn px-8 py-3">
          Back to invitation
        </Link>
      </div>
    </div>
  )
}

