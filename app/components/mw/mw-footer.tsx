import Link from 'next/link'

export type MwFooterVariant = 'event' | 'private' | 'story'

function InstagramIcon() {
  return (
    <svg className="size-7 shrink-0 min-w-7 min-h-7" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="4" y="4" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="10.5" r="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const EVENT_PATH = '/make-a-wish'

const iconLinkClass = 'text-[var(--mw-text-muted)] hover:text-[var(--mw-gold)] transition-colors shrink-0'
const textLinkClass = 'mw-font-body text-base text-[var(--mw-text-muted)] hover:text-[var(--mw-text-strong)]'

export function MwFooter({ variant }: { variant: MwFooterVariant }) {
  const maxWidth = variant === 'private' ? 'max-w-[1160px]' : 'max-w-[1120px]'

  if (variant === 'private') {
    return (
      <footer className="relative z-10 border-t border-[var(--mw-line-footer)]">
        <div className={`mx-auto flex w-full ${maxWidth} flex-wrap items-center justify-between gap-4 px-6 py-8`}>
          <p className={textLinkClass}>Midnight Teahouse · San Francisco</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/midnight_teahouse/"
              target="_blank"
              rel="noopener noreferrer"
              className={iconLinkClass}
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a href="mailto:midnight.teahouse.sf@gmail.com" className={textLinkClass}>
              Email
            </a>
            <Link href="/our-story" className={textLinkClass}>
              Our story
            </Link>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="relative z-10 border-t border-[var(--mw-line-footer)]">
      <div className={`mx-auto flex w-full ${maxWidth} flex-col items-center gap-4 px-6 py-8 text-center`}>
        <a href="mailto:midnight.teahouse.sf@gmail.com" className={textLinkClass}>
          Questions? midnight.teahouse.sf@gmail.com
        </a>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a
            href="https://www.instagram.com/midnight_teahouse/"
            target="_blank"
            rel="noopener noreferrer"
            className={iconLinkClass}
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
          {variant === 'event' ? (
            <>
              <Link href="/our-story" className={textLinkClass}>
                Our story
              </Link>
              <Link href="/private-events" className={textLinkClass}>
                Private events
              </Link>
            </>
          ) : (
            <>
              <Link href={EVENT_PATH} className={textLinkClass}>
                Upcoming gathering
              </Link>
              <Link href="/private-events" className={textLinkClass}>
                Private events
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  )
}
