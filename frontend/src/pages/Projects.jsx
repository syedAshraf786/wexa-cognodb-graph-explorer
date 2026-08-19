import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { getStatusColor } from '../utils/graphUtils';

export default function Projects() {
  const { data: projects, loading, error, refetch } = useApi(() => api.projects(), []);

  if (loading) return <LoadingSpinner message="Loading projects..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!projects?.length) return <EmptyState title="No projects found" />;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-100">Projects</h1>
      <p className="mb-6 text-gray-400">{projects.length} projects in the graph</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="card transition-colors hover:border-accent/50"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-semibold text-gray-100">{project.name}</h3>
              <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-gray-400">{project.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{project.company || 'Unknown company'}</span>
              <span>{project.techCount} technologies</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
