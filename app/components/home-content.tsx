'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/theme-context'
import { IconModal } from './icon-modal'

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

type HomeContentProps = {
  slots: IconSlot[]
  iconContent: Record<string, string>
}

export function HomeContent({ slots, iconContent }: HomeContentProps) {
  const { theme } = useTheme()
  const [displayTheme, setDisplayTheme] = useState(theme)
  const [iconOpacity, setIconOpacity] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<IconSlot | null>(null)
  const [iconSourceRect, setIconSourceRect] = useState<DOMRect | null>(null)
  const iconRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (theme === displayTheme) return
    setIconOpacity(0)
    const t = setTimeout(() => {
      setDisplayTheme(theme)
      setIconOpacity(1)
    }, 250)
    return () => clearTimeout(t)
  }, [theme, displayTheme])

  // Clear selected slot after backdrop fade so floating icon stays visible during close
  useEffect(() => {
    if (!modalOpen) {
      const t = setTimeout(() => {
        setSelectedSlot(null)
        setIconSourceRect(null)
      }, 350)
      return () => clearTimeout(t)
    }
  }, [modalOpen])

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 md:py-24">
      <IconModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedSlot={selectedSlot}
        iconSourceRect={iconSourceRect}
        iconRefs={iconRefs}
        displayTheme={displayTheme}
        iconContent={iconContent}
      />
      {/* Mobile: vertical stack. Desktop (md+): circle with absolute positions */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 md:relative md:aspect-square md:max-h-[min(80vw,70vh)] md:gap-0">
        {slots.map((slot) => {
          const image = displayTheme === 'day' ? slot.imageDay : slot.imageNight
          return (
            <button
              key={slot.id}
              type="button"
              data-background-obstacle="icon"
              className={`icon-slot-button flex min-h-[88px] cursor-pointer flex-col items-center justify-center border-none bg-transparent p-0 transition-transform duration-300 hover:scale-110 md:min-h-0 md:absolute md:justify-start ${positionClasses[slot.position]}`}
              style={{
                ['--icon-height' as string]: `${slot.maxHeight ?? 120}px`,
                ['--slot-scale' as string]: String(slot.scale ?? 1),
              }}
              onClick={() => {
                const rect = iconRefs.current.get(slot.id)?.getBoundingClientRect()
                setSelectedSlot(slot)
                setIconSourceRect(rect ?? null)
                setModalOpen(true)
              }}
            >
              {image ? (
                <div
                  ref={(el) => {
                    if (el) iconRefs.current.set(slot.id, el)
                  }}
                  className="icon-slot-icon flex items-center justify-center transition-opacity duration-300"
                  style={{
                    opacity:
                      modalOpen && selectedSlot?.id === slot.id ? 0 : iconOpacity,
                  }}
                >
                  <Image
                    src={image}
                    alt={slot.label}
                    width={120}
                    height={120}
                    className={`max-h-[72px] w-20 object-contain transition-opacity duration-300 md:max-h-[var(--icon-height)] md:w-28 ${slot.mobileWider ? 'md:w-40' : ''}`}
                  />
                </div>
              ) : (
                <span className="text-[#f8f6f2]/40 text-2xl">+</span>
              )}
              <span className="page-icon-label font-cursive text-3xl whitespace-nowrap md:text-3xl">
                {slot.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
