'use client'

import { useEffect } from 'react'

type IconModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function IconModal({ isOpen, onClose }: IconModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <div
      className={`icon-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Modal"
      aria-hidden={!isOpen}
    >
      <div
        className={`icon-modal-content relative max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl border-2 border-[#f8f6f2] p-8 transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-[0.98]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
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
          {/* Placeholder content for testing */}
          <p className="font-cursive text-[#f8f6f2] text-lg">
            Modal content will go here.
          </p>
        </div>
      </div>
    </div>
  )
}
