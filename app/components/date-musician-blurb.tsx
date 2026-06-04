'use client'

import { useLayoutEffect, useRef, useState, type SyntheticEvent } from 'react'

const MAX_LINES = 5

type DateMusicianBlurbProps = {
  blurb: string
  websiteUrl?: string
  instagramUrl?: string
  textClassName?: string
}

function blurbExceedsMaxLines(el: HTMLParagraphElement): boolean {
  const lineHeight = Number.parseFloat(window.getComputedStyle(el).lineHeight)
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) return false

  const hadClamp = el.classList.contains('carrd-blurb-clamp')
  if (hadClamp) el.classList.remove('carrd-blurb-clamp')
  const fullHeight = el.scrollHeight
  if (hadClamp) el.classList.add('carrd-blurb-clamp')

  return fullHeight > lineHeight * MAX_LINES + 1
}

export function DateMusicianBlurb({
  blurb,
  websiteUrl,
  instagramUrl,
  textClassName = 'text-[#D9D0BF]/90 leading-snug',
}: DateMusicianBlurbProps) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const hasLinks = Boolean(websiteUrl || instagramUrl)
  const showToggle = overflows
  const showLinks = hasLinks && (expanded || !overflows)

  useLayoutEffect(() => {
    setExpanded(false)
  }, [blurb])

  useLayoutEffect(() => {
    if (expanded) return
    const el = textRef.current
    if (!el) return

    const measure = () => {
      setOverflows(blurbExceedsMaxLines(el))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [blurb, expanded, textClassName])

  const stopBubble = (e: SyntheticEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="mt-1 min-w-0" onClick={stopBubble} onKeyDown={stopBubble}>
      <p
        ref={textRef}
        className={`${textClassName} whitespace-pre-line ${expanded ? '' : 'carrd-blurb-clamp'}`}
      >
        {blurb}
      </p>
      {showLinks ? (
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="carrd-link underline hover:no-underline"
              onClick={stopBubble}
            >
              Website
            </a>
          ) : null}
          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="carrd-link underline hover:no-underline"
              onClick={stopBubble}
            >
              Instagram
            </a>
          ) : null}
        </p>
      ) : null}
      {showToggle ? (
        <button
          type="button"
          className="carrd-link text-sm underline hover:no-underline mt-1 cursor-pointer bg-transparent border-0 p-0 font-inherit"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {expanded ? 'Less' : 'More'}
        </button>
      ) : null}
    </div>
  )
}
