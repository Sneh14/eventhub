import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export default function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  const inputId = props.id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 select-none">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm text-gray-900 bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-colors duration-150 placeholder:text-gray-400
          ${error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'}
        `}
        {...props}
      />
      {error      && <p className="text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
