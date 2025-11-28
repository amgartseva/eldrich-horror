import { useMemo, useState } from 'react'
import type { Asset } from '../card/card'
import './parameter-form.css'

type ParameterFormProps = {
  datasetName: string
  assets: Asset[]
  onCardSelect: (card: Asset) => void
  onNoMatchChange: (hasNoMatch: boolean) => void
  stopWords?: {
    types?: string[]
    modifiers?: string[]
  }
}

function pickRandomAsset(list: Asset[]): Asset {
  if (list.length === 0) {
    throw new Error('Cannot pick from empty list')
  }

  // Calculate total count (weight) - default to 1 if count is not specified
  const totalCount = list.reduce((sum, asset) => {
    const count = asset.count ?? 1
    return sum + count
  }, 0)

  if (totalCount === 0) {
    // Fallback to simple random selection if all counts are 0
    const index = Math.floor(Math.random() * list.length)
    return list[index] ?? list[0]
  }

  // Generate random number between 0 and totalCount
  const random = Math.random() * totalCount

  // Find which card the random number falls into based on cumulative counts
  let cumulativeCount = 0
  for (const asset of list) {
    const count = asset.count ?? 1
    cumulativeCount += count
    if (random < cumulativeCount) {
      return asset
    }
  }

  // Fallback (should never reach here, but TypeScript needs it)
  return list[list.length - 1] ?? list[0]
}

export default function ParameterForm({
  datasetName,
  assets,
  onCardSelect,
  onNoMatchChange,
  stopWords,
}: ParameterFormProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [filterLogic, setFilterLogic] = useState<'AND' | 'OR'>('AND')

  // Extract unique types from assets
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>()
    const stopTypes = stopWords?.types ?? []
    assets.forEach((asset) => {
      if (asset.type) {
        if (Array.isArray(asset.type)) {
          asset.type.forEach((type) => {
            const trimmedType = type.trim()
            if (trimmedType && !stopTypes.includes(trimmedType)) {
              types.add(trimmedType)
            }
          })
        } else {
          // Handle comma-separated types in a string (e.g., "Талант, Дар")
          const typeStrings = asset.type
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t && !stopTypes.includes(t))
          typeStrings.forEach((type) => {
            types.add(type)
          })
        }
      }
    })
    return Array.from(types).sort()
  }, [assets, stopWords])

  // Extract unique modifiers from assets
  const uniqueModifiers = useMemo(() => {
    const modifiers = new Set<string>()
    const stopModifiers = stopWords?.modifiers ?? []
    assets.forEach((asset) => {
      if (asset.modifiers && Array.isArray(asset.modifiers)) {
        asset.modifiers.forEach((modifier) => {
          const normalizedModifier = modifier.trim()
          if (
            normalizedModifier &&
            !stopModifiers.includes(normalizedModifier)
          ) {
            modifiers.add(normalizedModifier)
          }
        })
      }
    })
    return Array.from(modifiers).sort()
  }, [assets, stopWords])

  const toggleTypeSelection = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const toggleModifierSelection = (modifier: string) => {
    setSelectedModifiers((prev) =>
      prev.includes(modifier)
        ? prev.filter((m) => m !== modifier)
        : [...prev, modifier],
    )
  }

  const toggleFilterLogic = () => {
    setFilterLogic((prev) => (prev === 'AND' ? 'OR' : 'AND'))
  }

  const handleDatasetClick = () => {
    // Apply all selected parameters when picking a card
    const filteredAssets = assets.filter((asset) => {
      // Logic for types: AND / OR based on filterLogic state
      const matchesType =
        selectedTypes.length === 0
          ? true
          : (() => {
              // Normalize asset.type to array for easier comparison
              // Handle both array and comma-separated string
              const assetTypes = Array.isArray(asset.type)
                ? asset.type.map((t) => t.trim())
                : asset.type
                  ? asset.type
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t)
                  : []

              if (filterLogic === 'AND') {
                // Card must have ALL selected types
                return selectedTypes.every((selectedType) =>
                  assetTypes.includes(selectedType),
                )
              }

              // OR logic: card must have AT LEAST ONE of the selected types
              return selectedTypes.some((selectedType) =>
                assetTypes.includes(selectedType),
              )
            })()

      // Logic for modifiers: AND / OR based on filterLogic state
      const matchesModifiers =
        selectedModifiers.length === 0
          ? true
          : (() => {
              if (!asset.modifiers || !Array.isArray(asset.modifiers)) {
                return false
              }

              if (filterLogic === 'AND') {
                // Card must have ALL selected modifiers
                return selectedModifiers.every((modifier) =>
                  asset.modifiers?.includes(modifier),
                )
              }

              // OR logic: card must have AT LEAST ONE of the selected modifiers
              return selectedModifiers.some((modifier) =>
                asset.modifiers?.includes(modifier),
              )
            })()

      return matchesType && matchesModifiers
    })

    if (filteredAssets.length === 0) {
      onNoMatchChange(true)
      return
    }

    onNoMatchChange(false)
    const randomCard = pickRandomAsset(filteredAssets)
    onCardSelect(randomCard)
  }

  const handleTypeClick = (type: string) => {
    // When a type is selected via its button, ignore checkboxes and pick from that type only
    const filteredAssets = assets.filter((asset) => {
      if (Array.isArray(asset.type)) {
        return asset.type.map((t) => t.trim()).includes(type)
      }
      if (asset.type) {
        // Handle comma-separated types
        const assetTypes = asset.type
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t)
        return assetTypes.includes(type)
      }
      return false
    })
    if (filteredAssets.length > 0) {
      onNoMatchChange(false)
      const randomCard = pickRandomAsset(filteredAssets)
      onCardSelect(randomCard)
    } else {
      onNoMatchChange(true)
    }
  }

  const handleModifierClick = (modifier: string) => {
    // When a modifier is selected via its button, ignore checkboxes and pick from that modifier only
    const filteredAssets = assets.filter(
      (asset) => asset.modifiers && asset.modifiers.includes(modifier),
    )
    if (filteredAssets.length > 0) {
      onNoMatchChange(false)
      const randomCard = pickRandomAsset(filteredAssets)
      onCardSelect(randomCard)
    } else {
      onNoMatchChange(true)
    }
  }

  return (
    <div className="parameter-form">
      <div className="parameter-form__dataset-wrapper">
        <button
          type="button"
          className="parameter-form__dataset-button"
          onClick={handleDatasetClick}
        >
          {datasetName}
        </button>
        <button
          type="button"
          className="parameter-form__logic-button"
          onClick={toggleFilterLogic}
        >
          <span
            className={`parameter-form__logic-text${
              filterLogic === 'AND' ? ' parameter-form__logic-text--active' : ''
            }`}
          >
            AND
          </span>
          <span
            className={`parameter-form__logic-text${
              filterLogic === 'OR' ? ' parameter-form__logic-text--active' : ''
            }`}
          >
            OR
          </span>
        </button>
      </div>
      <div className="parameter-form__section">
        {uniqueTypes.length > 0 && (
          <>
            {uniqueTypes.map((type) => (
              <div key={type} className="parameter-form__item">
                <div className="parameter-form__checkbox-wrapper">
                  <label className="parameter-form__label">
                    <input
                      type="checkbox"
                      className="parameter-form__checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleTypeSelection(type)}
                    />
                    <span className="parameter-form__checkmark"></span>
                  </label>
                </div>
                <button
                  type="button"
                  className={`parameter-form__button${
                    selectedTypes.includes(type)
                      ? ' parameter-form__button--selected'
                      : ''
                  }`}
                  onClick={() => handleTypeClick(type)}
                >
                  {type}
                </button>
              </div>
            ))}
          </>
        )}
        {uniqueModifiers.length > 0 && (
          <>
            {uniqueModifiers.map((modifier) => (
              <div key={modifier} className="parameter-form__item">
                <div className="parameter-form__checkbox-wrapper">
                  <label className="parameter-form__label">
                    <input
                      type="checkbox"
                      className="parameter-form__checkbox"
                      checked={selectedModifiers.includes(modifier)}
                      onChange={() => toggleModifierSelection(modifier)}
                    />
                    <span className="parameter-form__checkmark"></span>
                  </label>
                </div>
                <button
                  type="button"
                  className={`parameter-form__button${
                    selectedModifiers.includes(modifier)
                      ? ' parameter-form__button--selected'
                      : ''
                  }`}
                  onClick={() => handleModifierClick(modifier)}
                >
                  {modifier}
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
