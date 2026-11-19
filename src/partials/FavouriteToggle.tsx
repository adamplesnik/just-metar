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
      className={`flex h-8 items-center gap-2 rounded-lg px-2 py-1 text-xs text-main-dim uppercase ${
        disabled
          ? 'cursor-not-allowed opacity-30'
          : 'cursor-pointer hover:bg-container-bright hover:text-main'
      }`}
    >
      <input
        type="checkbox"
        checked={isFavourite}
        disabled={disabled}
        onChange={(e) => (e.target.checked ? onAdd() : onRemove())}
        className="cursor-[inherit] accent-main"
      />
      Fav
    </label>
  )
}
