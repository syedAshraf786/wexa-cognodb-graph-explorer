export const NODE_COLORS = {
  Developer: '#3b82f6',
  Project: '#10b981',
  Technology: '#f59e0b',
  Skill: '#8b5cf6',
  Company: '#ef4444',
  Team: '#06b6d4',
  Role: '#ec4899',
  Unknown: '#6b7280',
};

export function getNodeColor(label) {
  return NODE_COLORS[label] || NODE_COLORS.Unknown;
}

export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-500/20 text-green-400';
    case 'maintenance':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'planning':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

export function formatExperience(years) {
  if (!years) return 'N/A';
  return `${years} yr${years !== 1 ? 's' : ''}`;
}
