/**
 * Parses document-style content files.
 * Section headers: # Greeting | # Question | # Body | # SignOff
 * Edit the .md files in content/ - they read like documents.
 */

import fs from 'fs'
import path from 'path'

export type SectionType = 'greeting' | 'question' | 'body' | 'signOff'

export type TitleModalSection = { type: SectionType; text: string }

function parseTitleModalDoc(raw: string): TitleModalSection[] {
  const sections: TitleModalSection[] = []
  const lines = raw.split('\n')
  let currentType: SectionType = 'body'
  let currentText: string[] = []

  const flush = () => {
    const text = currentText.join('\n').trim()
    if (text) sections.push({ type: currentType, text })
    currentText = []
  }

  for (const line of lines) {
    const match = line.match(/^#\s*(.+)$/)
    if (match) {
      flush()
      const header = match[1].trim().toLowerCase().replace(/\s+/g, '')
      if (header === 'greeting') currentType = 'greeting'
      else if (header === 'question') currentType = 'question'
      else if (header === 'signoff' || header === 'sign-off') currentType = 'signOff'
      else currentType = 'body'
    } else {
      currentText.push(line)
    }
  }
  flush()
  return sections
}

export function getTitleModalContent(): TitleModalSection[] {
  const filePath = path.join(process.cwd(), 'content', 'title-modal.md')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return parseTitleModalDoc(raw)
}

export function getEventInviteContent(): string {
  const filePath = path.join(process.cwd(), 'content', 'event-invite.md')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return raw.replace(/^#\s*Welcome\s*\n+/i, '').trim()
}

export function getIconModalContent(slotId: string): string {
  const filePath = path.join(process.cwd(), 'content', 'modals', `${slotId}.md`)
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return raw.trim()
  } catch {
    return ''
  }
}
