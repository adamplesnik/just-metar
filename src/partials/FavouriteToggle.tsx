type Props = {
  isFavourite: boolean
  canAdd: boolean
  onAdd: () => void
  onRemove: () => void
}

export default function FavouriteToggle({
  isFavourite,
  canAdd,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div className="flex h-10 w-full flex-3 items-center justify-end">
      {isFavourite ? (
        <button
          type="button"
          onClick={onRemove}
          className="h-8 cursor-pointer rounded px-2 py-1 text-xs text-main-dim uppercase hover:bg-container hover:text-main"
        >
          Remove from fav
        </button>
      ) : (
        <button
          type="button"
          disabled={!canAdd}
          onClick={onAdd}
          className="h-8 cursor-pointer rounded px-2 py-1 text-xs text-main-dim uppercase hover:bg-container hover:text-main disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          Add to fav
        </button>
      )}
    </div>
  )
}
