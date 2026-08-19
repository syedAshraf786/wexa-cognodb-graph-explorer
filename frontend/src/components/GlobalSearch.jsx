import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GlobalSearch({ placeholder = 'Search developers, projects, technologies...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data);
        setOpen(true);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigateTo = (type, id) => {
    setOpen(false);
    setQuery('');
    const routes = {
      developers: `/developers/${id}`,
      projects: `/projects/${id}`,
      technologies: `/technologies/${id}`,
      companies: `/developers`,
    };
    navigate(routes[type] || '/');
  };

  const hasResults = results && (
    results.developers?.length ||
    results.projects?.length ||
    results.technologies?.length ||
    results.companies?.length
  );

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder={placeholder}
          className="input pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-surface-border bg-surface-raised shadow-xl">
          {loading && <p className="p-4 text-sm text-gray-400">Searching...</p>}
          {!loading && !hasResults && (
            <p className="p-4 text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
          )}
          {!loading && hasResults && (
            <div className="max-h-80 overflow-y-auto p-2">
              {[
                { key: 'technologies', label: 'Technologies' },
                { key: 'developers', label: 'Developers' },
                { key: 'projects', label: 'Projects' },
                { key: 'companies', label: 'Companies' },
              ].map(({ key, label }) =>
                results[key]?.length > 0 && (
                  <div key={key} className="mb-2">
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {label}
                    </p>
                    {results[key].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(key, item.id)}
                        className="flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-surface-border/50"
                      >
                        <span className="font-medium text-gray-200">{item.name}</span>
                        {item.category && (
                          <span className="ml-2 text-xs text-gray-500">{item.category}</span>
                        )}
                        {item.location && (
                          <span className="ml-2 text-xs text-gray-500">{item.location}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
