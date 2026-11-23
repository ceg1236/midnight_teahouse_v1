import Link from 'next/link'

export type MwNavVariant = 'event' | 'private' | 'story'

const EVENT_PATH = '/make-a-wish'

type NavLink = {
  label: string
  href: string
  current?: boolean
  gold?: boolean
}

function linksForVariant(variant: MwNavVariant): { wordmarkHref: string; links: NavLink[] } {
  switch (variant) {
    case 'event':
      return {
        wordmarkHref: '/',
        links: [
          { label: 'Our story', href: '/our-story' },
          { label: 'Private events', href: '/private-events' },
          { label: 'Reserve', href: '#evenings', gold: true },
        ],
      }
    case 'private':
      return {
        wordmarkHref: '/',
        links: [
          { label: 'Our story', href: '/our-story' },
          { label: 'Private events', href: '/private-events', current: true },
          { label: 'Upcoming gathering', href: EVENT_PATH },
        ],
      }
    case 'story':
      return {
        wordmarkHref: EVENT_PATH,
        links: [
          { label: 'Our story', href: '/our-story', current: true },
          { label: 'Private events', href: '/private-events' },
          { label: 'Reserve', href: `${EVENT_PATH}#evenings`, gold: true },
        ],
      }
  }
}

export function MwNav({ variant }: { variant: MwNavVariant }) {
  const { wordmarkHref, links } = linksForVariant(variant)
  const maxWidth = variant === 'private' ? 'max-w-[1160px]' : 'max-w-[1120px]'

  return (
    <nav className={`relative z-10 mx-auto flex w-full ${maxWidth} flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-5`}>
      <Link href={wordmarkHref} className="mw-font-body text-base text-[var(--mw-text-muted)] hover:text-[var(--mw-text-strong)]">
        Midnight Teahouse
      </Link>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {links.map((link) =>
          link.gold ? (
            <a key={link.label} href={link.href} className="mw-font-body text-base font-bold text-[var(--mw-gold)] hover:brightness-110">
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              aria-current={link.current ? 'page' : undefined}
              className={`mw-font-body text-base ${
                link.current
                  ? 'text-[var(--mw-text-strong)] underline underline-offset-4'
                  : 'text-[var(--mw-text-muted)] hover:text-[var(--mw-text-strong)]'
              }`}
            >
              {link.label}
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
