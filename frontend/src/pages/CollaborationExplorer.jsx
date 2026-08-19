import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Share2, Users, Cpu, FolderKanban } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function CollaborationExplorer() {
  const [searchParams] = useSearchParams();
  const initialDev = searchParams.get('developer');

  const [developers, setDevelopers] = useState([]);
  const [selectedId, setSelectedId] = useState(initialDev || '');
  const [collaborators, setCollaborators] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.developers()
      .then(setDevelopers)
      .catch(() => {})
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    if (initialDev) findCollaborators(initialDev);
  }, [initialDev]);

  const findCollaborators = async (id) => {
    if (!id) return;
    setSelectedId(id);
    setLoading(true);
    setError(null);
    try {
      const data = await api.collaborators(id);
      setCollaborators(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedDev = developers.find((d) => d.id === selectedId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Find Potential Collaborators</h1>
        <p className="mt-1 text-gray-400">
          Discover developers connected through shared technologies, projects, and teams —
          a query that becomes awkward with many relational joins.
        </p>
      </div>

      <div className="mb-6 card">
        <label htmlFor="developer-select" className="mb-2 block text-sm font-medium text-gray-300">
          Select a Developer
        </label>
        {listLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <select
            id="developer-select"
            value={selectedId}
            onChange={(e) => findCollaborators(e.target.value)}
            className="input max-w-md"
            disabled={loading}
          >
            <option value="">Choose a developer...</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.company}</option>
            ))}
          </select>
        )}
      </div>

      {loading && <LoadingSpinner message="Finding potential collaborators..." />}
      {error && <ErrorMessage message={error} onRetry={() => findCollaborators(selectedId)} />}

      {!loading && !error && selectedId && collaborators?.length === 0 && (
        <EmptyState
          title="No collaboration recommendations found"
          message="No other developers share technologies, projects, or teams with this person."
          icon={Share2}
        />
      )}

      {!loading && !error && collaborators?.length > 0 && (
        <div>
          <p className="mb-4 text-sm text-gray-400">
            Found {collaborators.length} potential collaborator{collaborators.length !== 1 ? 's' : ''} for{' '}
            <strong className="text-gray-200">{selectedDev?.name}</strong>
          </p>

          <div className="space-y-4">
            {collaborators.map((c) => (
              <div key={c.id} className="card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link to={`/developers/${c.id}`} className="text-lg font-semibold text-gray-100 hover:text-accent">
                      {c.name}
                    </Link>
                    <p className="text-sm text-gray-500">{c.location} · {c.experience} years</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-green-400" />
                    <span className="badge bg-green-500/20 text-green-400">
                      Strength: {c.strength}
                    </span>
                  </div>
                </div>

                <p className="mt-3 rounded-md bg-surface p-3 text-sm text-gray-300">
                  <strong className="text-gray-400">Why recommended:</strong> {c.reason}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {c.sharedTechnologies?.length > 0 && (
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                        <Cpu className="h-3 w-3" /> Shared Technologies
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.sharedTechnologies.map((t) => (
                          <span key={t} className="badge bg-amber-500/20 text-amber-400">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.sharedProjects?.length > 0 && (
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                        <FolderKanban className="h-3 w-3" /> Shared Projects
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.sharedProjects.map((p) => (
                          <span key={p} className="badge bg-green-500/20 text-green-400">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.sharedTeams?.length > 0 && (
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                        <Users className="h-3 w-3" /> Shared Teams
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.sharedTeams.map((t) => (
                          <span key={t} className="badge bg-cyan-500/20 text-cyan-400">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
