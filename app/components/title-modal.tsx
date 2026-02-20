'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TitleModalSection } from '../../content/parse'

type TitleModalProps = {
  isOpen: boolean
  onClose: () => void
  titleSourceRect: DOMRect | null
  titleRef: React.RefObject<HTMLSpanElement>
  sections: TitleModalSection[]
}

const TRANSITION_MS = 400
const BACKDROP_FADE_MS = 300

export function TitleModal({
  isOpen,
  onClose,
  titleSourceRect,
  titleRef,
  sections,
}: TitleModalProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const [textPosition, setTextPosition] = useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)

  const getHeaderRect = useCallback(() => {
    return headerRef.current?.getBoundingClientRect() ?? null
  }, [])

  const getTitleTargetRect = useCallback(() => {
    return titleRef.current?.getBoundingClientRect() ?? null
  }, [titleRef])

  // Opening: animate from source to header
  useEffect(() => {
    if (!isOpen || !titleSourceRect) return

    setTextPosition({
      left: titleSourceRect.left,
      top: titleSourceRect.top,
      width: titleSourceRect.width,
      height: titleSourceRect.height,
    })

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = setTimeout(() => {
          const headerRect = getHeaderRect()
          if (headerRect && headerRect.width > 0) {
            setTextPosition({
              left: headerRect.left + (headerRect.width - titleSourceRect.width) / 2,
              top: headerRect.top + 16,
              width: titleSourceRect.width,
              height: titleSourceRect.height,
            })
          }
        }, 50)
      })
    })
    return () => {
      cancelAnimationFrame(raf)
      if (timeoutId != null) clearTimeout(timeoutId)
    }
  }, [isOpen, titleSourceRect, getHeaderRect])

  const handleClose = useCallback(() => {
    const targetRect = getTitleTargetRect()
    if (targetRect) {
      setTextPosition({
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      })
    }

    setTimeout(() => {
      onClose()
    }, TRANSITION_MS)
  }, [getTitleTargetRect, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setTextPosition(null), BACKDROP_FADE_MS)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  return (
    <div
      className={`icon-modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Modal"
      aria-hidden={!isOpen}
    >
      {textPosition && (
        <div
          className="pointer-events-none fixed z-[60] flex items-center justify-center transition-all ease-out"
          style={{
            left: textPosition.left,
            top: textPosition.top,
            width: textPosition.width,
            height: textPosition.height,
            transitionDuration: `${TRANSITION_MS}ms`,
          }}
        >
          <span className="font-cursive text-xl text-[#f8f6f2] md:text-2xl whitespace-nowrap">
            midnight teahouse
          </span>
        </div>
      )}

      <div
        className={`icon-modal-content relative my-auto w-full max-w-2xl max-h-[85vh] flex-shrink-0 overflow-y-auto rounded-3xl pt-20 pb-8 pl-8 pr-8 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
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
        <div className="pr-10 space-y-4 text-[#f8f6f2] text-lg">
          {sections.map((section, i) => {
            const isAccent = section.type === 'greeting' || section.type === 'question' || section.type === 'signOff'
            const fontClass = isAccent ? 'font-modal-accent' : 'font-modal-body'
            return (
              <div key={i} className={fontClass}>
                {section.text.split(/\n\n+/).map((para, j) => (
                  <p key={j} className={j > 0 ? 'mt-4' : ''}>{para}</p>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
