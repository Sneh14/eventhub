const VARIANTS = {
  success: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  warning: 'bg-amber-100   text-amber-700   ring-1 ring-amber-200',
  danger:  'bg-red-100     text-red-700     ring-1 ring-red-200',
  info:    'bg-blue-100    text-blue-700    ring-1 ring-blue-200',
  indigo:  'bg-indigo-100  text-indigo-700  ring-1 ring-indigo-200',
  default: 'bg-gray-100    text-gray-600    ring-1 ring-gray-200',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${VARIANTS[variant] ?? VARIANTS.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
