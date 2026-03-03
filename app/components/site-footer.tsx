import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="w-full flex justify-center border-t border-[#D9D0BF]/30">
      <div className="w-full max-w-[60rem] px-6 md:px-12 py-5 flex flex-wrap items-center justify-center gap-5">
        <Link
          href="/our-story"
          className="carrd-font-body text-xs md:text-sm tracking-[0.18em] uppercase text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors"
        >
          Our Story
        </Link>
        <a
          href="https://forms.gle/fC6RsHUwzndXRb6L9"
          target="_blank"
          rel="noopener noreferrer"
          className="carrd-font-body text-xs md:text-sm tracking-[0.18em] uppercase text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors"
        >
          Leave a note
        </a>
        <a
          href="mailto:hello@midnightteahouse.com"
          className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors"
          aria-label="Email"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 40 40" aria-hidden>
            <path d="M37.5,12.6l-17.5,11.9L2.5,12.6c-.2-.1-.3-.2-.5-.2v-2.7c0-.8.6-1.4,1.4-1.4h33.1c.8,0,1.4.6,1.4,1.4v2.7c-.2,0-.4,0-.5.2ZM19.5,26.3c.2.1.3.2.5.2s.4,0,.5-.2l17.5-11.9v16.9c0,.8-.6,1.4-1.4,1.4H3.4c-.8,0-1.4-.6-1.4-1.4V14.4l17.5,11.9Z" />
          </svg>
        </a>
        <a
          href="https://forms.gle/fC6RsHUwzndXRb6L9"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors"
          aria-label="Leave a note form"
        >
          <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none" aria-hidden>
            <rect x="7" y="9" width="26" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16h16M12 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </a>
        <a
          href="https://instagram.com/midnightteahouse"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors"
          aria-label="Instagram"
        >
          <span className="inline-flex items-center justify-center rounded-full border border-[#D9D0BF]/70 w-9 h-9">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 40 40" aria-hidden>
              <path d="M20,11c2.9,0,3.3,0,4.5,0.1c1.1,0.1,1.7,0.2,2.1,0.4c0.5,0.2,0.9,0.5,1.3,0.9c0.4,0.4,0.7,0.8,0.9,1.3c0.2,0.4,0.3,1,0.4,2.1C29.7,17,29.7,17.4,29.7,20s0,3-0.1,4.2c-0.1,1.1-0.2,1.7-0.4,2.1c-0.2,0.5-0.5,0.9-0.9,1.3c-0.4,0.4-0.8,0.7-1.3,0.9c-0.4,0.2-1,0.3-2.1,0.4C23.3,29.7,22.9,29.7,20,29.7s-3,0-4.2-0.1c-1.1-0.1-1.7-0.2-2.1-0.4c-0.5-0.2-0.9-0.5-1.3-0.9c-0.4-0.4-0.7-0.8-0.9-1.3c-0.2-0.4-0.3-1-0.4-2.1C11.3,23,11.3,22.6,11.3,20s0-3,0.1-4.2c0.1-1.1,0.2-1.7,0.4-2.1c0.2-0.5,0.5-0.9,0.9-1.3c0.4-0.4,0.8-0.7,1.3-0.9c0.4-0.2,1-0.3,2.1-0.4C17,11,17.4,11,20,11 M20,9c-3,0-3.4,0-4.6,0.1c-1.2,0.1-2.1,0.2-2.9,0.5c-0.8,0.3-1.5,0.7-2.1,1.3c-0.6,0.6-1,1.3-1.3,2.1c-0.3,0.8-0.4,1.7-0.5,2.9C9.5,17.1,9.5,17.5,9.5,20s0,2.9,0.1,4.1c0.1,1.2,0.2,2.1,0.5,2.9c0.3,0.8,0.7,1.5,1.3,2.1c0.6,0.6,1.3,1,2.1,1.3c0.8,0.3,1.7,0.4,2.9,0.5C16.6,30.5,17,30.5,20,30.5s3.4,0,4.6-0.1c1.2-0.1,2.1-0.2,2.9-0.5c0.8-0.3,1.5-0.7,2.1-1.3c0.6-0.6,1-1.3,1.3-2.1c0.3-0.8,0.4-1.7,0.5-2.9c0.1-1.2,0.1-1.6,0.1-4.1s0-2.9-0.1-4.1c-0.1-1.2-0.2-2.1-0.5-2.9c-0.3-0.8-0.7-1.5-1.3-2.1c-0.6-0.6-1.3-1-2.1-1.3c-0.8-0.3-1.7-0.4-2.9-0.5C23.4,9,23,9,20,9L20,9z" />
              <path d="M20,15.4c-2.6,0-4.6,2.1-4.6,4.6s2.1,4.6,4.6,4.6s4.6-2.1,4.6-4.6S22.6,15.4,20,15.4z M20,22.6c-1.4,0-2.6-1.1-2.6-2.6 c0-1.4,1.1-2.6,2.6-2.6c1.4,0,2.6,1.1,2.6,2.6C22.6,21.4,21.4,22.6,20,22.6z" />
              <circle cx="24.8" cy="15.2" r="1.1" />
            </svg>
          </span>
        </a>
      </div>
    </footer>
  )
}

