import { StrictMode, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Card, { type Asset } from './components/card/card'
import ParameterForm from './components/parameter-form/parameter-form'
import assets from './data/assets.json'
import artefacts from './data/artefacts.json'
import conditions from './data/conditions.json'
import spells from './data/spells.json'
import uniqueAssets from './data/unique_assets.json'
import './reset.css'
import './style.css'
import './tokens.css'

// Define stop words for each dataset
// Add words you want to exclude from being displayed as buttons
const stopWordsConfig: Record<
  string,
  { types?: string[]; modifiers?: string[] }
> = {
  Состояния: {
    types: ['Преследование', 'Соглашение', 'Воздействие', 'Препятствие'],
    modifiers: ['Обычное'],
  },
  Заклинания: {
    modifiers: ['Командная'],
  },
  Активы: {
    modifiers: ['Командная'],
  },
  Артефакты: {
    types: ['Безделушка'],
    modifiers: ['Командная'],
  },
  'Уникальные активы': {
    modifiers: ['Оружие'],
  },
}

// Define your datasets here - add more JSON imports as needed
const datasets = [
  {
    name: 'Активы',
    data: assets,
  },
  {
    name: 'Артефакты',
    data: artefacts,
  },
  {
    name: 'Состояния',
    data: conditions,
  },
  {
    name: 'Заклинания',
    data: spells,
  },
  {
    name: 'Уникальные активы',
    data: uniqueAssets,
  },
]

function App() {
  const [card, setCard] = useState<Asset | null>(null)
  const [previousCard, setPreviousCard] = useState<Asset | null>(null)
  const [hasNoMatch, setHasNoMatch] = useState(false)
  const [cardKey, setCardKey] = useState(0)
  const [showGhost, setShowGhost] = useState(false)
  const ghostTimeoutRef = useRef<number | null>(null)

  const handleCardSelect = (selectedCard: Asset) => {
    // Clear any pending ghost card removal
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current)
      ghostTimeoutRef.current = null
    }
    // Save the current card as previous before setting the new one
    setHasNoMatch(false)
    setShowGhost(false)
    if (card) {
      setPreviousCard(card)
    }
    setCard(selectedCard)
    // Increment key to force remount even if same card is picked
    setCardKey((prev) => prev + 1)
  }

  const handleNoMatch = (hasNoMatch: boolean) => {
    // Clear any existing timeout FIRST
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current)
      ghostTimeoutRef.current = null
    }
    
    if (hasNoMatch) {
      if (card) {
        // We have a card, show it as ghost
        setHasNoMatch(true)
        setPreviousCard(card)
        setCard(null) // Clear the current card so it doesn't show again on next no-match
        setShowGhost(true)
        // Increment key so ghost gets remounted with animation
        setCardKey((prev) => prev + 1)
        // Clear the ghost card after animation completes (0.4s)
        ghostTimeoutRef.current = window.setTimeout(() => {
          setShowGhost(false)
          setPreviousCard(null)
          ghostTimeoutRef.current = null
        }, 400)
      } else {
        // No current card, just show error without ghost
        setHasNoMatch(true)
        setShowGhost(false)
        setPreviousCard(null)
      }
    } else {
      // Not a no-match scenario
      setHasNoMatch(false)
      setShowGhost(false)
    }
  }

  return (
    <>
      <div className="app__card-container">
        {hasNoMatch ? (
          <>
            <p className="app__error-message">Такой карты нет</p>
            {showGhost && previousCard && (
              <div key={`ghost-${cardKey}`} className="app__ghost-card app__ghost-card--hiding">
                <Card card={previousCard} />
              </div>
            )}
          </>
        ) : card ? (
          <>
            <div key={cardKey} className="app__animation-container">
              <Card card={card} />
            </div>
            {previousCard && (
              <div key={`ghost-${cardKey}`} className="app__ghost-card app__ghost-card--static">
                <Card card={previousCard} />
              </div>
            )}
          </>
        ) : (
          ''
        )}
      </div>
      <div className="app__settings">
        {datasets.map((dataset) => (
          <ParameterForm
            key={dataset.name}
            datasetName={dataset.name}
            assets={dataset.data}
            onCardSelect={handleCardSelect}
            onNoMatchChange={handleNoMatch}
            stopWords={stopWordsConfig[dataset.name]}
          />
        ))}
      </div>
    </>
  )
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
