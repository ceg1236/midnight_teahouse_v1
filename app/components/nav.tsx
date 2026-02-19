'use client'

import Link from 'next/link'
import { useTheme } from '../context/theme-context'
import { useTitleModal } from '../context/title-modal-context'

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { titleRef, openTitleModal, titleModalOpen } = useTitleModal()

  return (
    <nav className="site-nav fixed top-0 left-0 right-0 z-50 bg-[#162143] backdrop-blur-sm">
      <div className="container mx-auto px-6 py-5 flex items-center justify-center gap-12">
        <Link
          href="/"
          className="nav-link-hover font-cursive text-lg text-[#f8f6f2]"
        >
          {/* home */}
        </Link>
        <button
          type="button"
          onClick={openTitleModal}
          className="mx-8 cursor-pointer border-none bg-transparent p-0 text-[#f8f6f2]"
        >
          <span
            ref={titleRef}
            className={`font-cursive text-xl md:text-2xl transition-opacity duration-300 ${titleModalOpen ? 'opacity-0' : 'opacity-100'}`}
          >
            midnight teahouse
          </span>
        </button>
        <Link
          href="/reservations"
          className="nav-link-hover font-cursive text-lg text-[#f8f6f2]"
        >
          {/* reservations */}
        </Link>
        <button
          type="button"
          onClick={() => setTheme(theme === 'night' ? 'day' : 'night')}
          className="site-nav-toggle absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:opacity-80 transition-opacity text-[#f8f6f2]"
          aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
        >
          {theme === 'night' ? (
            <MoonIcon className="w-6 h-6" />
          ) : (
            <SunIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </nav>
  )
}
