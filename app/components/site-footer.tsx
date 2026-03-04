import Link from 'next/link'

type SiteFooterProps = {
  variant?: 'main' | 'default'
  className?: string
}

export function SiteFooter({ variant = 'default', className }: SiteFooterProps) {
  const isMain = variant === 'main'

  return (
    <footer className={`w-full flex justify-center ${className ?? ''}`}>
      <div className="w-full max-w-[60rem] px-4 md:px-12 py-4 md:py-6 flex items-center justify-center gap-8 md:gap-10">
        <div className="flex items-center justify-center gap-8">
          <a
            href="mailto:hello@midnightteahouse.com"
            className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors shrink-0"
            aria-label="Email"
          >
            <svg className="size-7 shrink-0 min-w-7 min-h-7" fill="currentColor" viewBox="0 0 40 40" aria-hidden>
              <path d="M37.5,12.6l-17.5,11.9L2.5,12.6c-.2-.1-.3-.2-.5-.2v-2.7c0-.8.6-1.4,1.4-1.4h33.1c.8,0,1.4.6,1.4,1.4v2.7c-.2,0-.4,0-.5.2ZM19.5,26.3c.2.1.3.2.5.2s.4,0,.5-.2l17.5-11.9v16.9c0,.8-.6,1.4-1.4,1.4H3.4c-.8,0-1.4-.6-1.4-1.4V14.4l17.5,11.9Z" />
            </svg>
          </a>
          <a
            href="https://forms.gle/fC6RsHUwzndXRb6L9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors shrink-0"
            aria-label="Leave a note form"
          >
            <svg className="size-7 shrink-0 min-w-7 min-h-7" viewBox="0 0 40 40" fill="none" aria-hidden>
              <rect x="7" y="9" width="26" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M12 16h16M12 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </a>
          <a
            href="https://instagram.com/midnightteahouse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors shrink-0"
            aria-label="Instagram"
          >
            <svg className="size-7 shrink-0 min-w-7 min-h-7" viewBox="0 0 40 40" fill="none" aria-hidden>
              <rect x="11" y="11" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="24.5" cy="15.5" r="1.3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </a>
        </div>

        {isMain && (
          <div className="ml-2">
            <Link
              href="/our-story"
              className="carrd-link text-sm whitespace-nowrap"
            >
              Our Story
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}

