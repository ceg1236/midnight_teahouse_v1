'use client'

import Link from 'next/link'
import { useEffect } from 'react'

const STORAGE_KEY = 'teahouse_reservation'

export default function InviteSuccessPage() {
  useEffect(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])
  return (
    <div className="carrd-page flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="carrd-font-heading text-3xl md:text-4xl [font-variant:small-caps]">
          See you in the Teahouse
        </h1>
        <p className="carrd-font-body text-lg leading-relaxed opacity-90">
          Thank you for reserving your spot. We&apos;ll send a confirmation email shortly.
        </p>
        <Link
          href="/"
          className="carrd-btn px-10 py-4 font-inherit text-xl"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
