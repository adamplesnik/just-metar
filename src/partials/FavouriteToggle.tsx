import { useEffect, useState } from 'react'

type Props = {
  isFavourite: boolean
  canAdd: boolean
  onAdd: () => void
  onRemove: () => void
}

type Feedback = 'added' | 'removed' | null

const FEEDBACK_MS = 1500

export default function FavouriteToggle({
  isFavourite,
  canAdd,
  onAdd,
  onRemove,
}: Props) {
  const [feedback, setFeedback] = useState<Feedback>(null)

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleAdd = () => {
    onAdd()
    setFeedback('added')
  }

  const handleRemove = () => {
    onRemove()
    setFeedback('removed')
  }

  return (
    <div className="flex h-10 w-full flex-3 items-center justify-end">
      {feedback ? (
        <span
          role="status"
          className={`flex h-8 items-center px-2 py-1 text-xs uppercase ${
            feedback === 'added' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {feedback === 'added' ? 'Added' : 'Removed'}
        </span>
      ) : isFavourite ? (
        <button
          type="button"
          onClick={handleRemove}
          className="h-8 cursor-pointer rounded px-2 py-1 text-xs text-main-dim uppercase hover:bg-container hover:text-main"
        >
          Remove from fav
        </button>
      ) : (
        <button
          type="button"
          disabled={!canAdd}
          onClick={handleAdd}
          className="h-8 cursor-pointer rounded px-2 py-1 text-xs text-main-dim uppercase hover:bg-container hover:text-main disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          Add to fav
        </button>
      )}
    </div>
  )
}
