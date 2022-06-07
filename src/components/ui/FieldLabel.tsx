export const FieldLabel: React.FC<{ id?: string; label: string }> = ({
  id,
  label,
}) => {
  return (
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
  )
}
