const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`
        inline-block animate-spin rounded-full
        border-gray-200 border-t-indigo-600
        ${SIZES[size] ?? SIZES.md}
        ${className}
      `}
    />
  );
}
