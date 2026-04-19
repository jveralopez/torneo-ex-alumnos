import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  helper?: string
}

export function Checkbox({
  label,
  helper,
  className = '',
  id,
  ...props
}: CheckboxProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={inputId}
        className={`
          mt-1 h-5 w-5 rounded border-2 border-green-300 text-green-600
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          cursor-pointer accent-green-600
          ${className}
        `}
        {...props}
      />
      <div className="flex flex-col">
        <label htmlFor={inputId} className="text-sm font-semibold text-green-800 cursor-pointer">
          {label}
        </label>
        {helper && <p className="mt-0.5 text-sm text-green-600">{helper}</p>}
      </div>
    </div>
  )
}