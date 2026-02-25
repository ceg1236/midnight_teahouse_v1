import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from './context/theme-context'
import { TitleModalProvider } from './context/title-modal-context'
import { getTitleModalContent } from '../content/parse'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Midnight Teahouse',
    template: '%s | Midnight Teahouse',
  },
  description: 'An evening at the Enchanted Teahouse - cozy and warm, intimate connections in SOMA.',
  openGraph: {
    title: 'Midnight Teahouse',
    description: 'An evening at the Enchanted Teahouse - cozy and warm, intimate connections in SOMA.',
    url: baseUrl,
    siteName: 'My Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="text-foreground bg-background"
    >
      <body className="antialiased">
        <div id="root">
          <ThemeProvider>
            <TitleModalProvider titleContent={getTitleModalContent()}>
              {children}
            </TitleModalProvider>
          </ThemeProvider>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
