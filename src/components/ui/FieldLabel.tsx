export const FieldLabel = ({ id, label }: { id?: string; label: string }) => {
  return (
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
  )
}
