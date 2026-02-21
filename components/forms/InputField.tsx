'use client'

import React from 'react'

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  id: string
  error?: string
  helperText?: string
  required?: boolean
  prefix?: string
  suffix?: string
  onChange?: (value: string) => void
}

export function InputField({
  label,
  id,
  error,
  helperText,
  required = false,
  prefix,
  suffix,
  onChange,
  className = '',
  ...props
}: InputFieldProps) {
  const hasError = !!error

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}

        <input
          id={id}
          onChange={handleChange}
          className={`
            block w-full rounded-md shadow-sm
            ${prefix ? 'pl-7' : 'pl-3'}
            ${suffix ? 'pr-12' : 'pr-3'}
            py-2
            border
            ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-accent focus:border-accent'}
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />

        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
