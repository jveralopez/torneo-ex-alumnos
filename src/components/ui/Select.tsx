interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-green-800">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          mt-1 block w-full rounded-xl border-2 px-4 py-2.5 text-slate-900
          focus:outline-none focus:ring-2 transition-all
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-green-200 focus:border-green-500 focus:ring-green-500 bg-white'
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  )
}