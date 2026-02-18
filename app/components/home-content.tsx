'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTheme } from '../context/theme-context'

export type IconSlot = {
  id: string
  href: string
  label: string
  imageNight: string
  imageDay: string
  position: string
  /** Optional max height in px (e.g. for taller icons like kora) */
  maxHeight?: number
  /** On mobile, use wider container (e.g. for table icon) */
  mobileWider?: boolean
  /** Optional scale factor (e.g. 1.3 = 30% bigger, 0.85 = 15% smaller) */
  scale?: number
}

/* Desktop (md+): absolute positions for circle layout */
const positionClasses: Record<string, string> = {
  top: 'md:top-[12%] md:left-1/2 md:-translate-x-1/2',
  'top-left': 'md:top-[38%] md:left-[18%]',
  'top-right': 'md:top-[38%] md:right-[18%]',
  right: 'md:top-1/2 md:-translate-y-1/2 md:right-[12%]',
  'bottom-left': 'md:bottom-[38%] md:left-[18%]',
  'bottom-right': 'md:bottom-[38%] md:right-[18%]',
  bottom: 'md:bottom-[12%] md:left-1/2 md:-translate-x-1/2',
  left: 'md:top-1/2 md:-translate-y-1/2 md:left-[12%]',
}

export function HomeContent({ slots }: { slots: IconSlot[] }) {
  const { theme } = useTheme()
  const [displayTheme, setDisplayTheme] = useState(theme)
  const [iconOpacity, setIconOpacity] = useState(1)

  useEffect(() => {
    if (theme === displayTheme) return
    setIconOpacity(0)
    const t = setTimeout(() => {
      setDisplayTheme(theme)
      setIconOpacity(1)
    }, 250)
    return () => clearTimeout(t)
  }, [theme, displayTheme])

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-24">
      {/* Mobile: vertical stack. Desktop (md+): circle with absolute positions */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-16 md:relative md:aspect-square md:max-h-[min(80vw,70vh)] md:gap-0">
        {slots.map((slot) => {
          const image = displayTheme === 'day' ? slot.imageDay : slot.imageNight
          return (
            <Link
              key={slot.id}
              href={slot.href}
              data-background-obstacle="icon"
              className={`flex min-h-[140px] flex-col items-center justify-center gap-5 transition-transform duration-300 hover:scale-110 md:min-h-0 md:absolute md:justify-start ${positionClasses[slot.position]}`}
              style={{ ['--icon-height' as string]: `${slot.maxHeight ?? 120}px` }}
            >
              {image ? (
                <Image
                  src={image}
                  alt={slot.label}
                  width={120}
                  height={120}
                  className={`max-h-[120px] object-contain transition-opacity duration-300 md:w-28 md:max-h-[var(--icon-height)] ${slot.mobileWider ? 'w-40' : 'w-24'}`}
                  style={{
                    opacity: iconOpacity,
                    ...(slot.scale != null && { transform: `scale(${slot.scale})` }),
                  }}
                />
              ) : (
                <span className="text-[#f8f6f2]/40 text-2xl">+</span>
              )}
              <span className="page-icon-label font-cursive text-base whitespace-nowrap md:text-xl">
                {slot.label}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
