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
}

const positionClasses: Record<string, string> = {
  top: 'top-[12%] left-1/2 -translate-x-1/2',
  'top-left': 'top-[38%] left-[18%]',
  'top-right': 'top-[38%] right-[18%]',
  right: 'top-1/2 -translate-y-1/2 right-[12%]',
  'bottom-left': 'bottom-[38%] left-[18%]',
  'bottom-right': 'bottom-[38%] right-[18%]',
  bottom: 'bottom-[12%] left-1/2 -translate-x-1/2',
  left: 'top-1/2 -translate-y-1/2 left-[12%]',
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
      <div className="relative w-full max-w-4xl aspect-square max-h-[min(80vw,70vh)]">
        {slots.map((slot) => {
          const image = displayTheme === 'day' ? slot.imageDay : slot.imageNight
          return (
            <Link
              key={slot.id}
              href={slot.href}
              className={`absolute flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-110 ${positionClasses[slot.position]}`}
            >
              {image ? (
                <span
                  className="inline-block w-20 md:w-28 transition-opacity duration-300"
                  style={{
                    opacity: iconOpacity,
                    maxHeight: slot.maxHeight ? `${slot.maxHeight}px` : undefined,
                  }}
                >
                  <Image
                    src={image}
                    alt={slot.label}
                    width={120}
                    height={120}
                    className="w-full h-auto object-contain"
                    style={slot.maxHeight ? { maxHeight: `${slot.maxHeight}px` } : undefined}
                  />
                </span>
              ) : (
                <span className="text-[#f8f6f2]/40 text-2xl">+</span>
              )}
              <span className="page-icon-label font-cursive text-[#f8f6f2] text-lg md:text-xl whitespace-nowrap">
                {slot.label}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
