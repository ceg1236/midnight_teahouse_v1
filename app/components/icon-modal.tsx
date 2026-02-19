'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export type IconModalSlot = {
  id: string
  label: string
  imageNight: string
  imageDay: string
  maxHeight?: number
  mobileWider?: boolean
  scale?: number
}

type IconModalProps = {
  isOpen: boolean
  onClose: () => void
  selectedSlot: IconModalSlot | null
  iconSourceRect: DOMRect | null
  iconRefs: React.RefObject<Map<string, HTMLDivElement>>
  displayTheme: 'day' | 'night'
}

const TRANSITION_MS = 400

export function IconModal({
  isOpen,
  onClose,
  selectedSlot,
  iconSourceRect,
  iconRefs,
  displayTheme,
}: IconModalProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const [iconPosition, setIconPosition] = useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  const [phase, setPhase] = useState<'idle' | 'entering' | 'visible' | 'exiting'>('idle')

  const getHeaderRect = useCallback(() => {
    return headerRef.current?.getBoundingClientRect() ?? null
  }, [])

  const getIconTargetRect = useCallback(() => {
    if (!selectedSlot) return null
    const el = iconRefs.current?.get(selectedSlot.id)
    return el?.getBoundingClientRect() ?? null
  }, [selectedSlot, iconRefs])

  // Opening: animate from source to header
  useEffect(() => {
    if (!isOpen || !selectedSlot || !iconSourceRect) return

    setPhase('entering')
    setIconPosition({
      left: iconSourceRect.left,
      top: iconSourceRect.top,
      width: iconSourceRect.width,
      height: iconSourceRect.height,
    })

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Small delay so modal is fully laid out before measuring header
        timeoutId = setTimeout(() => {
          const headerRect = getHeaderRect()
          if (headerRect && headerRect.width > 0) {
            const iconW = Math.min(iconSourceRect.width, 80)
            const iconH = Math.min(iconSourceRect.height, 80)
            setIconPosition({
              left: headerRect.left + (headerRect.width - iconW) / 2,
              top: headerRect.top + 16,
              width: iconW,
              height: iconH,
            })
          }
          setTimeout(() => setPhase('visible'), TRANSITION_MS)
        }, 50)
      })
    })
    return () => {
      cancelAnimationFrame(raf)
      if (timeoutId != null) clearTimeout(timeoutId)
    }
  }, [isOpen, selectedSlot, iconSourceRect, getHeaderRect])

  const handleClose = useCallback(() => {
    if (!selectedSlot) {
      onClose()
      return
    }

    setPhase('exiting')
    const targetRect = getIconTargetRect()
    if (targetRect) {
      setIconPosition({
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      })
    }

    // Wait for icon to finish sliding back, then close; icon fades with backdrop (no abrupt removal)
    setTimeout(() => {
      setPhase('idle')
      onClose()
    }, TRANSITION_MS)
  }, [selectedSlot, getIconTargetRect, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  // Reset icon state after backdrop fade completes – removing the icon during fade causes flicker
  const BACKDROP_FADE_MS = 300
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setIconPosition(null)
        setPhase('idle')
      }, BACKDROP_FADE_MS)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Lock body scroll when modal is open to prevent background scroll / border artifact
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  const image =
    selectedSlot && displayTheme === 'day'
      ? selectedSlot.imageDay
      : selectedSlot?.imageNight

  return (
    <div
      className={`icon-modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Modal"
      aria-hidden={!isOpen}
    >
      {/* Floating icon - outside modal content so position:fixed works (parent transform breaks it) */}
      {selectedSlot && image && iconPosition && (
        <div
          className="icon-modal-floating-icon pointer-events-none fixed z-[60] flex items-center justify-center transition-all ease-out"
          style={{
            left: iconPosition.left,
            top: iconPosition.top,
            width: iconPosition.width,
            height: iconPosition.height,
            transitionDuration: `${TRANSITION_MS}ms`,
          }}
        >
          <Image
            src={image}
            alt={selectedSlot.label}
            width={120}
            height={120}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div
        className={`icon-modal-content relative my-auto w-full max-w-2xl max-h-[85vh] flex-shrink-0 overflow-y-auto rounded-3xl border-2 border-[#f8f6f2] pt-20 pb-8 pl-8 pr-8 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header area - ref for icon target position */}
        <div
          ref={headerRef}
          className="absolute left-0 right-0 top-0 flex h-20 items-center justify-center"
        />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#f8f6f2] transition-opacity hover:opacity-80"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <div className="pr-10">
          {selectedSlot && (
            <h2 className="page-icon-label mb-4 font-cursive text-2xl">
              {selectedSlot.label}
            </h2>
          )}
          <p className="font-cursive text-[#f8f6f2] text-lg">
            Modal content will go here.
          </p>
        </div>
      </div>
    </div>
  )
}
