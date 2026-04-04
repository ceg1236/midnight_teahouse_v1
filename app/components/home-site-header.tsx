'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const MOBILE_BAR_OFFSET = 'calc(env(safe-area-inset-top, 0px) + 4.25rem)'

export function HomeSiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const mobileMenu =
    mounted && menuOpen
      ? createPortal(
          <div className="md:hidden">
            <button
              type="button"
              className="fixed inset-0 z-[200000] cursor-default bg-black/50"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <nav
              id="home-mobile-menu"
              className="fixed left-3 right-3 z-[200001] overflow-hidden rounded-lg border border-[rgba(232,224,213,0.18)] bg-[#140606] py-2 text-base shadow-[0_20px_60px_rgba(0,0,0,0.75)]"
              style={{ top: `calc(${MOBILE_BAR_OFFSET} + 6px)` }}
              role="dialog"
              aria-modal="true"
              aria-label="Site sections"
            >
              <a
                href="#gatherings"
                className="flex min-h-[3rem] items-center border-b border-[rgba(232,224,213,0.08)] px-5 font-medium text-[#f0e8dd] active:bg-white/5"
                onClick={closeMenu}
              >
                Gatherings
              </a>
              <a
                href="#private-events"
                className="flex min-h-[3rem] items-center border-b border-[rgba(232,224,213,0.08)] px-5 font-medium text-[#f0e8dd] active:bg-white/5"
                onClick={closeMenu}
              >
                Private events
              </a>
              <a
                href="#our-story"
                className="flex min-h-[3rem] items-center px-5 font-medium text-[#f0e8dd] active:bg-white/5"
                onClick={closeMenu}
              >
                Our Story
              </a>
            </nav>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <header
        className={
          'home-site-header mx-auto w-full max-w-[780px] border-b border-[rgba(232,224,213,0.12)] bg-[#2E0303] text-sm uppercase tracking-[0.12em] ' +
          /* Desktop: visible bar above hero (transparent bar read as “missing” on gradient) */
          'relative z-40 px-4 pt-[env(safe-area-inset-top,0px)] pb-3 md:bg-[#2E0303]/92 md:px-6 md:pt-5 md:pb-5 md:backdrop-blur-sm ' +
          /* Mobile: viewport-fixed bar; global.css reinforces so nothing overrides position */
          'max-md:fixed max-md:left-0 max-md:right-0 max-md:top-0 max-md:z-[500] max-md:max-w-none max-md:w-full max-md:bg-[#2E0303]'
        }
      >
        <div className="mx-auto flex h-14 max-w-[780px] items-center justify-between md:h-auto md:max-w-none">
          <Link
            href="/"
            className="min-w-0 shrink font-serif text-lg font-light tracking-[0.12em] text-[#e8e0d5] md:text-xl"
          >
            Midnight Teahouse
          </Link>

          <nav aria-label="Desktop" className="hidden md:block">
            <ul className="flex list-none gap-8">
              <li>
                <a
                  href="#gatherings"
                  className="text-[13px] tracking-[0.14em] text-[rgba(232,224,213,0.65)] transition-colors hover:text-[#e8e0d5] md:text-sm"
                >
                  Gatherings
                </a>
              </li>
              <li>
                <a
                  href="#private-events"
                  className="text-[13px] tracking-[0.14em] text-[rgba(232,224,213,0.65)] transition-colors hover:text-[#e8e0d5] md:text-sm"
                >
                  Private events
                </a>
              </li>
              <li>
                <a
                  href="#our-story"
                  className="text-[13px] tracking-[0.14em] text-[rgba(232,224,213,0.65)] transition-colors hover:text-[#e8e0d5] md:text-sm"
                >
                  Our Story
                </a>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            className="flex h-11 min-h-[44px] min-w-[44px] shrink-0 flex-col items-center justify-center gap-1.5 rounded border border-[rgba(232,224,213,0.22)] bg-[#2E0303] text-[#e8e0d5] md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </button>
        </div>
      </header>
      {mobileMenu}
    </>
  )
}
