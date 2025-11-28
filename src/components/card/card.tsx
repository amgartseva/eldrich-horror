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

  return (
    <div className="card app__card">
      {card.cost ? <div className="card__cost">{card.cost}$</div> : ''}
      <div className="card__count">{card.count}</div>
      <h2 className="card__title">{card.name}</h2>
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
