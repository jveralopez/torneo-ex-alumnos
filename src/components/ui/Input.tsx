import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export function Input({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-green-800">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          mt-1 block w-full rounded-xl border-2 px-4 py-2.5 text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 transition-all
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-green-200 focus:border-green-500 focus:ring-green-500 bg-white'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>}
      {helper && !error && <p className="mt-1 text-sm text-green-600">{helper}</p>}
    </div>
  )
}