import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-forest-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-forest-700 placeholder-gray-500 transition-colors
          focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-400
          ${error ? 'border-red-400 bg-red-50' : 'border-terracotta-400 bg-white hover:border-cream-400'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-sage-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-forest-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-forest-700 placeholder:text-gray-500 transition-colors resize-none
          focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-400
          ${error ? 'border-red-400 bg-red-50' : 'border-terracotta-400 bg-white hover:border-cream-400'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-sage-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-forest-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-forest-700 transition-colors
          focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-400
          ${error ? 'border-red-400 bg-red-50' : 'border-terracotta-400 bg-white hover:border-cream-400'}
          ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
