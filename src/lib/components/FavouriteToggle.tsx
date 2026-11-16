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
  const disabled = !isFavourite && !canAdd

  return (
    <label
      className={`jm:flex jm:h-8 jm:items-center jm:gap-2 jm:rounded jm:px-2 jm:py-1 jm:text-xs jm:text-main-dim jm:uppercase ${
        disabled
          ? 'jm:cursor-not-allowed jm:opacity-30'
          : 'jm:cursor-pointer jm:hover:bg-container-bright jm:hover:text-main'
      }`}
    >
      <input
        type="checkbox"
        checked={isFavourite}
        disabled={disabled}
        onChange={(e) => (e.target.checked ? onAdd() : onRemove())}
        className="jm:cursor-[inherit] jm:accent-main"
      />
      Fav
    </label>
  )
}
