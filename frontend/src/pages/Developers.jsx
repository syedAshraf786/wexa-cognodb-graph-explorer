import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Search } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatExperience } from '../utils/graphUtils';

export default function Developers() {
  const [search, setSearch] = useState('');
  const { data: developers, loading, error, refetch } = useApi(() => api.developers(), []);

  if (loading) return <LoadingSpinner message="Loading developers..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const filtered = developers?.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.company?.toLowerCase().includes(search.toLowerCase()) ||
    d.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Developers</h1>
          <p className="mt-1 text-gray-400">{developers?.length} developers in the graph</p>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter developers..."
            className="input pl-10"
          />
        </div>
      </div>

      {!filtered?.length ? (
        <EmptyState title="No developers found" message="Try adjusting your search filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dev) => (
            <Link
              key={dev.id}
              to={`/developers/${dev.id}`}
              className="card transition-colors hover:border-accent/50"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-100">{dev.name}</h3>
                  <p className="text-sm text-accent">{dev.role || 'Developer'}</p>
                </div>
                <span className="badge bg-blue-500/20 text-blue-400">
                  {formatExperience(dev.experience)}
                </span>
              </div>

              <div className="space-y-1.5 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  {dev.company || 'Unknown'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {dev.location || 'Unknown'}
                </div>
              </div>

              {dev.topTechnologies?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {dev.topTechnologies.map((tech) => (
                    <span key={tech} className="badge bg-surface-border text-gray-400">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
