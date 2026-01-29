import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#162143] backdrop-blur-sm">
      <div className="container mx-auto px-6 py-5 flex items-center justify-center gap-12">
        <Link
          href="/"
          className="font-body text-lg tracking-wide transition-colors duration-300 text-[#f8f6f2]"
        >
          home
        </Link>
        <Link href="/" className="group mx-8">
          <span className="font-heading text-xl md:text-2xl text-[#f8f6f2] tracking-wide">
            ✨ midnight teahouse ✨
          </span>
        </Link>
        <Link
          href="/reservations"
          className="font-body text-lg tracking-wide transition-colors duration-300 text-[#f8f6f2] hover:opacity-80"
        >
          reservations
        </Link>
      </div>
    </nav>
  )
}
