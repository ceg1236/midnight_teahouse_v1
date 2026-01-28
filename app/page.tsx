import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/lovable_hero.jpg"
            alt="Enchanted teahouse illustration"
            fill
            className="w-full h-full object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20">
          <div className="max-w-3xl w-full px-8 py-12 md:px-12 md:py-16 bg-foreground/60 backdrop-blur-md rounded-lg border border-foreground/20 shadow-lg animate-fade-in-up">
            <div className="max-w-2xl mx-auto">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-background leading-tight mb-8">
                An Evening at the
                <br />
                <span className="italic">Enchanted Teahouse</span>
              </h1>
            </div>
            <div className="max-w-xl mx-auto animate-fade-in-up-delay">
              <p className="font-body text-lg md:text-xl text-background/95 leading-relaxed mb-4">
                ✨ Hi friend, welcome to the Midnight Teahouse ✨
              </p>
              <p className="font-body text-base md:text-lg text-background/85 leading-relaxed">
                We're delighted to invite you into our beloved evening world—cozy nights of tea, live music, and slow, intimate connections.
              </p>
            </div>
            <div className="mt-12 animate-fade-in-up-delay-2">
              <Link
                href="/reservations"
                className="inline-block px-8 py-4 bg-background/90 hover:bg-background text-foreground font-body text-lg tracking-wide rounded-sm transition-all duration-300 shadow-md"
              >
                request an evening →
              </Link>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float-slow">
            <span className="font-body text-sm text-background drop-shadow-lg">scroll</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 md:py-32 bg-background paper-texture">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="font-body text-lg md:text-xl text-foreground/85 leading-relaxed mb-8">
              Each evening is a unique blend of curated teas and ethereal soundscapes—an invitation for you to step away from the everyday rhythm of the city and enter a softer, more intimate alcove.
            </p>
            <p className="font-heading text-xl md:text-2xl italic text-foreground/75">
              A place where, as Mary Oliver writes,
              <br />
              "let the soft animal of your body love what it loves."
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-48 md:w-64 mx-auto mb-8 animate-float-slow h-48 md:h-64 flex items-center justify-center">
                <Image
                  src="/images/teacup-illustration-lovable.png"
                  alt="Steaming teacup illustration"
                  width={256}
                  height={256}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-body text-muted-foreground leading-relaxed">
                The night will be vibrant and social, and also welcoming of quieter, reflective moments to connect with yourself.
              </p>
            </div>
            <div className="text-center">
              <div className="w-48 md:w-64 mx-auto mb-8 animate-drift h-48 md:h-64 flex items-center justify-center">
                <Image
                  src="/images/lanterns-illustration-lovable.png"
                  alt="Glowing lanterns illustration"
                  width={256}
                  height={256}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-body text-muted-foreground leading-relaxed">
                It's our small gesture towards reintroducing romance and beauty back into San Francisco's nightlife.
              </p>
            </div>
          </div>
          <div className="max-w-xl mx-auto text-center mt-20 pt-12 border-t border-border">
            <p className="font-body text-foreground/75 mb-2">With love,</p>
            <p className="font-heading text-xl italic text-foreground">Your Tea Fairies ✨</p>
            <p className="font-body text-sm text-muted-foreground mt-4 italic">
              P.S. We're actively experimenting with the design of our evenings in all aspects, and learning as we go. Each night may be a little different.
            </p>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-24 md:py-32 bg-card paper-texture">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground text-center mb-12">Details</h2>
            <div className="space-y-8 text-center">
              <div className="p-8 border border-border rounded-sm bg-background/50">
                <p className="font-body text-lg text-foreground leading-relaxed">
                  Each reservation includes <span className="italic">unlimited caffeinated and non-caffeinated tea</span>. Once you're in, everything is included—no transactions, just presence.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border border-border rounded-sm bg-background/50">
                  <p className="font-heading text-xl text-foreground mb-2">Doors open</p>
                  <p className="font-body text-2xl text-primary">7pm</p>
                </div>
                <div className="p-6 border border-border rounded-sm bg-background/50">
                  <p className="font-heading text-xl text-foreground mb-2">We close</p>
                  <p className="font-body text-2xl text-primary">11pm</p>
                </div>
              </div>
              <div className="p-8 border border-border rounded-sm bg-background/50">
                <p className="font-body text-foreground/85 leading-relaxed mb-4">📵 It's a phone and laptop-free space</p>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  We'll share the location the week of the event with everyone who has made a reservation.
                </p>
              </div>
              <p className="font-body text-foreground/75 italic pt-4">
                We encourage you to invite someone you've been meaning to spend quality time with 🧡
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background border-t border-border paper-texture">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto text-center">
            <p className="font-heading text-2xl text-foreground mb-6">✨ midnight teahouse ✨</p>
            <p className="font-body text-muted-foreground mb-8">A hidden alcove in San Francisco</p>
            <div className="flex justify-center gap-8 mb-8">
              <a
                href="https://www.instagram.com/midnight_teahouse/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-foreground/70 hover:text-foreground transition-colors"
              >
                instagram
              </a>
              <a
                href="mailto:hello@midnightteahouse.sf"
                className="font-body text-foreground/70 hover:text-foreground transition-colors"
              >
                email
              </a>
            </div>
            <p className="font-body text-sm text-muted-foreground">SOMA, San Francisco</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
