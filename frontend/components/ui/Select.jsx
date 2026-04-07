/** @type {Array<{value: string, label: string}>} */
const EMPTY_OPTS = [];

export default function Select({
  label       = undefined,
  /** @type {Array<{value: string, label: string}>} */
  options     = EMPTY_OPTS,
  error       = undefined,
  helperText  = undefined,
  required    = false,
  placeholder = undefined,
  id          = undefined,
  className   = '',
  ...props
}) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 select-none">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm text-gray-900 bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-colors duration-150 appearance-none cursor-pointer
          ${error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error      && <p className="text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
