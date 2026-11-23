type AnimatedTitleProps = {
  text: string
  className?: string
}

/** "Make a Wish" style title: each letter its own span that drifts gently; spaces are not animated.
 *  Letters within a word are wrapped in a non-breaking group so lines only break between words. */
export function AnimatedTitle({ text, className = '' }: AnimatedTitleProps) {
  const words = text.split(' ')
  let i = -1
  const wordNodes: React.ReactNode[] = []

  words.forEach((word, wi) => {
    if (wi > 0) wordNodes.push(' ')
    wordNodes.push(
      <span key={wi} aria-hidden style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
        {word.split('').map((ch) => {
          i += 1
          const up = i % 2 === 0 ? 1 : -1
          // Estonia is a connected script font: with each letter isolated in its own span
          // (no neighbor context), Safari/CoreText and Chrome/HarfBuzz pick different
          // contextual-alternate glyphs for the same isolated letter — Safari in particular
          // substitutes much more ornate "isolated form" swashes on nearly every letter.
          // Disabling contextual/discretionary features forces the plain default glyph
          // everywhere, consistently across browsers. 'titl' is re-enabled only on M/W,
          // which is the one swash the design actually wants (see spec).
          const isSwashLetter = ch === 'M' || ch === 'W'
          const featureSettings = isSwashLetter
            ? "'calt' 0, 'liga' 0, 'dlig' 0, 'clig' 0, 'titl' 1"
            : "'calt' 0, 'liga' 0, 'dlig' 0, 'clig' 0"
          return (
            <span
              key={i}
              className="mw-title-letter"
              style={
                {
                  '--mw-up': up,
                  '--mw-letter-dur': `${5200 + 260 * i}ms`,
                  '--mw-letter-delay': `${180 * i}ms`,
                  fontFeatureSettings: featureSettings,
                  fontVariantLigatures: 'none',
                } as React.CSSProperties
              }
            >
              {ch}
            </span>
          )
        })}
      </span>
    )
  })

  return (
    <h1 aria-label={text} className={`mw-font-title ${className}`}>
      {wordNodes}
    </h1>
  )
}
