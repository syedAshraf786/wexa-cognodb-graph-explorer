import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function Technologies() {
  const [search, setSearch] = useState('');
  const { data: technologies, loading, error, refetch } = useApi(() => api.technologies(), []);

  if (loading) return <LoadingSpinner message="Loading technologies..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const filtered = technologies?.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Technologies</h1>
          <p className="mt-1 text-gray-400">{technologies?.length} technologies in the graph</p>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter technologies..."
            className="input pl-10"
          />
        </div>
      </div>

      {!filtered?.length ? (
        <EmptyState title="No technologies found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tech) => (
            <Link
              key={tech.id}
              to={`/technologies/${tech.id}`}
              className="card flex items-center justify-between transition-colors hover:border-accent/50"
            >
              <div>
                <h3 className="font-semibold text-gray-100">{tech.name}</h3>
                <p className="text-sm text-gray-500">{tech.category}</p>
              </div>
              <span className="badge bg-surface-border text-gray-400">
                {tech.developerCount} devs
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
