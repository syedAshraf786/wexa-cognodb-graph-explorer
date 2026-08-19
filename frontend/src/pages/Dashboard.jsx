import { Link } from 'react-router-dom';
import { Users, FolderKanban, Cpu, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import LoadingSpinner, { SkeletonGrid } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import GlobalSearch from '../components/GlobalSearch';
import { getStatusColor } from '../utils/graphUtils';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-100">{value ?? '—'}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(() => api.dashboard(), []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-100">Dashboard</h1>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const { stats, mostConnectedTechnologies, recentProjects, popularTechnologies } = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="mt-1 text-gray-400">
          Explore your developer knowledge graph at a glance
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Developers" value={stats.developers} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={FolderKanban} label="Projects" value={stats.projects} color="bg-green-500/20 text-green-400" />
        <StatCard icon={Cpu} label="Technologies" value={stats.technologies} color="bg-amber-500/20 text-amber-400" />
        <StatCard icon={Building2} label="Companies" value={stats.companies} color="bg-red-500/20 text-red-400" />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-200">Quick Search</h2>
        <GlobalSearch placeholder="Try searching for React, Aisha, or Platform..." />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-gray-200">Most Connected Technologies</h2>
          </div>
          <div className="space-y-3">
            {mostConnectedTechnologies?.map((tech, i) => (
              <Link
                key={tech.id}
                to={`/technologies/${tech.id}`}
                className="flex items-center justify-between rounded-md p-2 hover:bg-surface-border/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-200">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.category}</p>
                  </div>
                </div>
                <span className="badge bg-surface-border text-gray-300">
                  {tech.connections} connections
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-200">Recent Projects</h2>
          <div className="space-y-3">
            {recentProjects?.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between rounded-md p-2 hover:bg-surface-border/30"
              >
                <div>
                  <p className="font-medium text-gray-200">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.company}</p>
                </div>
                <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-200">Popular Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {popularTechnologies?.map((tech) => (
              <Link
                key={tech.id}
                to={`/technologies/${tech.id}`}
                className="badge border border-surface-border bg-surface px-3 py-1.5 text-gray-300 hover:border-accent hover:text-accent"
              >
                {tech.name}
                <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
