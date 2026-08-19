import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, FolderKanban, Link2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function TechnologyDetail() {
  const { id } = useParams();
  const { data: tech, loading, error, refetch } = useApi(() => api.technology(id), [id]);

  if (loading) return <LoadingSpinner message="Loading technology..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!tech) return <EmptyState title="Technology not found" />;

  return (
    <div>
      <Link to="/technologies" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to Technologies
      </Link>

      <div className="mb-6 card">
        <h1 className="text-2xl font-bold text-gray-100">{tech.name}</h1>
        <p className="mt-1 text-accent">{tech.category}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="font-semibold text-gray-200">Developers Who Know It</h2>
          </div>
          {!tech.developers?.length ? (
            <p className="text-sm text-gray-500">No developers know this technology.</p>
          ) : (
            <div className="space-y-2">
              {tech.developers.map((d) => (
                <Link key={d.id} to={`/developers/${d.id}`} className="block rounded-md p-2 hover:bg-surface-border/30">
                  {d.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-green-400" />
            <h2 className="font-semibold text-gray-200">Projects Using It</h2>
          </div>
          {!tech.projects?.length ? (
            <p className="text-sm text-gray-500">No projects are connected to this technology.</p>
          ) : (
            <div className="space-y-2">
              {tech.projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="block rounded-md p-2 hover:bg-surface-border/30">
                  <p className="font-medium text-gray-200">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.status}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold text-gray-200">Related Technologies</h2>
          </div>
          {!tech.relatedTechnologies?.length ? (
            <p className="text-sm text-gray-500">No related technologies.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tech.relatedTechnologies.map((r) => (
                <Link key={r.id} to={`/technologies/${r.id}`} className="badge bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                  {r.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
