import * as React from "react"

const EASE_OUT_SOFT = "cubic-bezier(0.16, 1, 0.3, 1)"

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Fades the routed content in on every navigation and orders the card
 * cascade (see the Motion section of index.css) by document position, so a
 * page's panels settle in one after another even when they sit in different
 * containers. Uses the Web Animations API, so pages are not remounted.
 */
export function useRouteReveal<T extends HTMLElement>(routeKey: string) {
  const ref = React.useRef<T>(null)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    // Opacity only: a transform here would re-anchor fixed descendants.
    el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 240,
      easing: "ease-out",
    })

    const topLevelCards = Array.from(
      el.querySelectorAll<HTMLElement>('[data-slot="card"]'),
    ).filter((card) => !card.parentElement?.closest('[data-slot="card"]'))
    topLevelCards.forEach((card, i) => {
      card.style.setProperty("--reveal-i", String(i))
    })
  }, [routeKey])

  return ref
}

/**
 * Plays a quick settle animation on the returned element whenever `key`
 * changes (but not on mount, where the card entrance already plays). Meant
 * for detail panels that swap their content when the selection changes.
 */
export function useSwapAnimation<T extends HTMLElement>(key: unknown) {
  const ref = React.useRef<T>(null)
  const prevKey = React.useRef(key)

  React.useLayoutEffect(() => {
    if (Object.is(prevKey.current, key)) return
    prevKey.current = key
    if (!ref.current || prefersReducedMotion()) return
    ref.current.animate(
      [
        { opacity: 0.35, transform: "translateY(4px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 280, easing: EASE_OUT_SOFT },
    )
  }, [key])

  return ref
}
