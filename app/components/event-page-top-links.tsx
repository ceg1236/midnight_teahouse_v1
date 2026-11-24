import Link from 'next/link'

/** Home link on reservation and success pages. */
export function EventPageTopLinks() {
  return (
    <div className="w-full flex items-center justify-between px-6 md:px-12 pt-2 md:pt-4">
      <Link href="/" className="carrd-link carrd-link--muted text-sm whitespace-nowrap">
        Home
      </Link>
    </div>
  )
}
