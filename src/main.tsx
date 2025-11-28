import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Card, { type Asset } from './components/card/card'
import ParameterForm from './components/parameter-form/parameter-form'
import assets from './data/assets.json'
import artefacts from './data/artefacts.json'
import conditions from './data/conditions.json'
import spells from './data/spells.json'
import uniqueAssets from './data/unique_assets.json'
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
  const [hasNoMatch, setHasNoMatch] = useState(false)

  const handleCardSelect = (selectedCard: Asset) => {
    // Clear card first, then set new one for smooth transition
    setHasNoMatch(false)
    setCard(null)
    requestAnimationFrame(() => {
      setCard(selectedCard)
    })
  }

  return (
    <>
      <main className="app__main">
        <div className="app__card-container">
          {hasNoMatch ? (
            <p className="app__error-message">Такой карты нет</p>
          ) : card ? (
            <Card card={card} />
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
              onNoMatchChange={setHasNoMatch}
              stopWords={stopWordsConfig[dataset.name]}
            />
          ))}
        </div>
      </main>
    </>
  )
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
