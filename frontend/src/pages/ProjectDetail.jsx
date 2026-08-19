import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Users } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { getStatusColor } from '../utils/graphUtils';

export default function ProjectDetail() {
  const { id } = useParams();
  const { data: project, loading, error, refetch } = useApi(() => api.project(id), [id]);

  if (loading) return <LoadingSpinner message="Loading project..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!project) return <EmptyState title="Project not found" />;

  return (
    <div>
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="mb-6 card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{project.name}</h1>
            <p className="mt-2 text-gray-400">{project.description}</p>
          </div>
          <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">Owned by {project.company?.name || 'Unknown'}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-gray-200">Technologies</h2>
          </div>
          {!project.technologies?.length ? (
            <p className="text-sm text-gray-500">No projects are connected to this technology.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <Link key={t.id} to={`/technologies/${t.id}`} className="badge bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                  {t.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-200">Developers</h2>
          </div>
          {!project.developers?.length ? (
            <p className="text-sm text-gray-500">No developers assigned.</p>
          ) : (
            <div className="space-y-2">
              {project.developers.map((d) => (
                <Link key={d.id} to={`/developers/${d.id}`} className="block rounded-md p-2 hover:bg-surface-border/30">
                  <p className="font-medium text-gray-200">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.experience} years experience</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
