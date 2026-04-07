'use client';

const VARIANTS = {
  primary:   'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white border-transparent shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-gray-300 shadow-sm',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-transparent shadow-sm',
  ghost:     'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-600 border-transparent',
  emerald:   'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-transparent shadow-sm',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2   text-sm rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-base rounded-lg gap-2',
};

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  loading   = false,
  type      = 'button',
  className = '',
  // all other props (including onClick) passed through via spread
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium border
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size]    ?? SIZES.md}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
