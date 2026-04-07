'use client';

function buildPages(current, total) {
  const delta = 2;
  const range = [];
  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) range.push(i);

  if (range[0] > 2)     range.unshift('…');
  if (range[0] > 1)     range.unshift(1);
  if (range.at(-1) < total - 1) range.push('…');
  if (range.at(-1) < total)     range.push(total);
  return range;
}

export default function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = buildPages(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      {pages.map((page, i) =>
        page === '…' ? (
          <span key={`el-${i}`} className="w-9 text-center text-gray-400 select-none">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`
              w-9 h-9 rounded-lg text-sm font-medium transition-colors
              ${page === currentPage
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'}
            `}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </nav>
  );
}
