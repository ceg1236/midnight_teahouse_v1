import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { HeroVideo, HOME_HERO_POSTER, HOME_HERO_SOURCES } from './hero-video'

describe('HeroVideo', () => {
  /**
   * Regression: `<source>` nodes must exist in initial markup so cold loads start fetching MP4 immediately
   * (no IntersectionObserver gate). Poster stays until loadeddata; then video replaces it in the browser.
   */
  it('SSR markup includes poster, preload=auto, and every source', () => {
    const html = renderToStaticMarkup(<HeroVideo className="hv-test" />)

    expect(html).toContain(`poster="${HOME_HERO_POSTER}"`)
    expect(html).toContain('preload="auto"')
    for (const s of HOME_HERO_SOURCES) {
      expect(html).toContain(`src="${s.src}"`)
      expect(html).toContain(`type="${s.type}"`)
    }
  })
})
