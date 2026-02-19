'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { TitleModal } from '../components/title-modal'

type TitleModalContextValue = {
  titleRef: React.RefObject<HTMLSpanElement>
  openTitleModal: () => void
  titleModalOpen: boolean
}

const TitleModalContext = createContext<TitleModalContextValue | null>(null)

export function TitleModalProvider({ children }: { children: React.ReactNode }) {
  const [titleModalOpen, setTitleModalOpen] = useState(false)
  const [titleSourceRect, setTitleSourceRect] = useState<DOMRect | null>(null)
  const titleRef = useRef<HTMLSpanElement>(null)

  const openTitleModal = useCallback(() => {
    const rect = titleRef.current?.getBoundingClientRect()
    setTitleSourceRect(rect ?? null)
    setTitleModalOpen(true)
  }, [])

  useEffect(() => {
    if (!titleModalOpen) {
      const t = setTimeout(() => setTitleSourceRect(null), 350)
      return () => clearTimeout(t)
    }
  }, [titleModalOpen])

  return (
    <TitleModalContext.Provider value={{ titleRef, openTitleModal, titleModalOpen }}>
      {children}
      <TitleModal
        isOpen={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        titleSourceRect={titleSourceRect}
        titleRef={titleRef}
      />
    </TitleModalContext.Provider>
  )
}

export function useTitleModal() {
  const ctx = useContext(TitleModalContext)
  if (!ctx) throw new Error('useTitleModal must be used within TitleModalProvider')
  return ctx
}
