import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Briefcase, Users, Cpu, FolderKanban, Award, Share2, GitBranch, ArrowLeft,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatExperience, getNodeColor } from '../utils/graphUtils';

function Section({ icon: Icon, title, children, emptyMessage }) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);
  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
      </div>
      {isEmpty ? (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        children
      )}
    </div>
  );
}

export default function DeveloperDetail() {
  const { id } = useParams();
  const { data: dev, loading, error, refetch } = useApi(() => api.developer(id), [id]);
  const { data: network } = useApi(() => api.developerNetwork(id), [id]);
  const { data: collaborators } = useApi(() => api.collaborators(id), [id]);

  if (loading) return <LoadingSpinner message="Loading developer profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!dev) return <EmptyState title="Developer not found" />;

  return (
    <div>
      <Link to="/developers" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to Developers
      </Link>

      <div className="mb-8 card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{dev.name}</h1>
            <p className="text-accent">{dev.role?.title || 'Developer'}</p>
            <p className="mt-1 text-sm text-gray-400">{dev.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/graph?node=${dev.id}`} className="btn-primary">
              <GitBranch className="h-4 w-4" /> View in Graph
            </Link>
            <Link to={`/collaboration?developer=${dev.id}`} className="btn-secondary">
              <Share2 className="h-4 w-4" /> Find Collaborators
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {dev.company?.name || 'N/A'}</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {dev.team?.name || 'N/A'}</span>
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {dev.location}</span>
          <span>{formatExperience(dev.experience)} experience</span>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Section icon={Award} title="Skills" emptyMessage="No skills recorded.">
          <div className="flex flex-wrap gap-2">
            {dev.skills?.map((s) => (
              <span key={s.id} className="badge bg-purple-500/20 text-purple-400">{s.name}</span>
            ))}
          </div>
        </Section>

        <Section icon={Cpu} title="Technologies" emptyMessage="No technologies recorded.">
          <div className="flex flex-wrap gap-2">
            {dev.technologies?.map((t) => (
              <Link key={t.id} to={`/technologies/${t.id}`} className="badge bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                {t.name}
              </Link>
            ))}
          </div>
        </Section>

        <Section icon={FolderKanban} title="Projects" emptyMessage="No projects assigned.">
          <div className="space-y-2">
            {dev.projects?.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block rounded-md p-2 hover:bg-surface-border/30">
                <p className="font-medium text-gray-200">{p.name}</p>
                <p className="text-xs text-gray-500">{p.status}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section icon={Share2} title="Collaboration Recommendations" emptyMessage="No collaboration recommendations found.">
          <div className="space-y-3">
            {collaborators?.slice(0, 5).map((c) => (
              <Link key={c.id} to={`/developers/${c.id}`} className="block rounded-md border border-surface-border p-3 hover:border-accent/50">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-200">{c.name}</p>
                  <span className="badge bg-green-500/20 text-green-400">Strength: {c.strength}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{c.reason}</p>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-gray-200">Multi-Hop Traversal</h2>
        </div>
        <p className="mb-4 text-sm text-gray-400">
          Technologies used by projects that {dev.name}&apos;s teammates are working on
          (path: Developer → Team → Teammate → Project → Technology)
        </p>

        {!network?.teammateTechnologies?.length ? (
          <EmptyState title="No multi-hop discoveries" message="All teammate technologies are already known by this developer." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-gray-500">
                  <th className="pb-2 pr-4">Technology</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Via Teammate</th>
                  <th className="pb-2 pr-4">Via Project</th>
                  <th className="pb-2">Via Team</th>
                </tr>
              </thead>
              <tbody>
                {network.teammateTechnologies.map((t) => (
                  <tr key={t.id} className="border-b border-surface-border/50">
                    <td className="py-2 pr-4">
                      <Link to={`/technologies/${t.id}`} className="font-medium text-amber-400 hover:underline">
                        {t.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-gray-400">{t.category}</td>
                    <td className="py-2 pr-4 text-gray-400">{t.viaTeammate}</td>
                    <td className="py-2 pr-4 text-gray-400">{t.viaProject}</td>
                    <td className="py-2 text-gray-400">{t.viaTeam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 card">
        <h2 className="mb-3 text-lg font-semibold text-gray-200">Relationship Map</h2>
        <div className="flex flex-wrap gap-3">
          {['Developer', 'Project', 'Technology', 'Company', 'Team', 'Skill', 'Role'].map((label) => (
            <div key={label} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getNodeColor(label) }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
