import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No results found', message, icon: Icon = Inbox }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-12 text-center">
      <Icon className="h-10 w-10 text-gray-500" />
      <h3 className="text-lg font-medium text-gray-300">{title}</h3>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
