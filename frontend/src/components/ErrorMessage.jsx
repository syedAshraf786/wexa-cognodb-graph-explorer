import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  const isDbError = message?.toLowerCase().includes('graph database') ||
    message?.toLowerCase().includes('unavailable');

  return (
    <div className="card flex flex-col items-center gap-4 py-12 text-center">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <div>
        <h3 className="text-lg font-medium text-gray-100">
          {isDbError ? 'Unable to connect to the graph database' : 'Something went wrong'}
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}
