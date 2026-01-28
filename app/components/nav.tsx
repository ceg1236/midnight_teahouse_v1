import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8f6f2cc] backdrop-blur-sm">
      <div className="container mx-auto px-6 py-5 flex items-center justify-center gap-12">
        <Link
          href="/"
          className="font-body text-lg tracking-wide transition-colors duration-300 text-foreground"
        >
          home
        </Link>
        <Link href="/" className="group mx-8">
          <span className="font-heading text-xl md:text-2xl text-foreground tracking-wide">
            ✨ midnight teahouse ✨
          </span>
        </Link>
        <Link
          href="/reservations"
          className="font-body text-lg tracking-wide transition-colors duration-300 text-muted-foreground hover:text-foreground"
        >
          reservations
        </Link>
      </div>
    </nav>
  )
}
