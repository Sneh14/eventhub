'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Input    from '@/components/ui/Input';
import Select   from '@/components/ui/Select';
import Button   from '@/components/ui/Button';
import { useDebounce } from '@/lib/hooks/useDebounce';

const CATEGORIES = [
  { value: '',             label: 'All Categories' },
  { value: 'Conference',   label: '🎙 Conference'  },
  { value: 'Concert',      label: '🎵 Concert'     },
  { value: 'Sports',       label: '⚽ Sports'      },
  { value: 'Workshop',     label: '🛠 Workshop'    },
  { value: 'Festival',     label: '🎉 Festival'    },
];

const CITIES = [
  { value: '',            label: 'All Cities'  },
  { value: 'Mumbai',      label: 'Mumbai'      },
  { value: 'Bangalore',   label: 'Bangalore'   },
  { value: 'Delhi',       label: 'Delhi'       },
  { value: 'Hyderabad',   label: 'Hyderabad'   },
  { value: 'Chennai',     label: 'Chennai'     },
  { value: 'Pune',        label: 'Pune'        },
];

export default function EventFilters() {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const [search,   setSearch]   = useState(searchParams.get('search')   ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [city,     setCity]     = useState(searchParams.get('city')     ?? '');

  const debouncedSearch = useDebounce(search, 300);

  const push = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    params.delete('page');                         // reset to page 1
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Push debounced search to URL
  useEffect(() => {
    push({ search: debouncedSearch });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = search || category || city;

  const clearAll = () => {
    setSearch(''); setCategory(''); setCity('');
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search events, venues…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          options={CATEGORIES}
          value={category}
          onChange={(e) => { setCategory(e.target.value); push({ category: e.target.value }); }}
          className="sm:w-48"
        />
        <Select
          options={CITIES}
          value={city}
          onChange={(e) => { setCity(e.target.value); push({ city: e.target.value }); }}
          className="sm:w-40"
        />
        {hasFilters && (
          <Button variant="ghost" onClick={clearAll} className="whitespace-nowrap">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
