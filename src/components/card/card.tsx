import { useEffect, useRef, useState } from 'react'
import './card.css'

export type Asset = {
  name: string
  type: string | string[]
  modifiers: string[]
  cost?: number
  count?: number
}

type CardProps = {
  card: Asset
}

export default function Card({ card }: CardProps) {
  const modifiers = card.modifiers.length > 0 ? card.modifiers.join(', ') : ''
  const titleRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current && containerRef.current) {
        // Get the natural width of the title content
        const titleScrollWidth = titleRef.current.scrollWidth
        // Get the available width in the container (excluding decorations and gap)
        const containerWidth = containerRef.current.offsetWidth

        // If title content is wider than container, it's truncated
        setIsTruncated(titleScrollWidth > containerWidth)
      }
    }

    // Check on mount and when card name changes
    checkTruncation()

    // Also check on window resize
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [card.name])

  return (
    <div className="card app__card">
      {card.cost ? <div className="card__cost">{card.cost}$</div> : ''}
      <div className="card__count">{card.count}</div>
      <div className="card__title-container" ref={containerRef}>
        <span className="card__title-decoration"></span>
        <h2
          className={`card__title${isTruncated ? ' card__title--truncated' : ''}`}
          ref={titleRef}
        >
          {card.name}
        </h2>
        <span className="card__title-decoration"></span>
      </div>
      <p className="card__details">
        <span className="card__type">
          {Array.isArray(card.type) ? card.type.join(', ') : card.type}
        </span>
        {modifiers ? (
          <>
            {' – '} <i className="card__modifiers">{modifiers}</i>
          </>
        ) : (
          ''
        )}
      </p>
    </div>
  )
}
