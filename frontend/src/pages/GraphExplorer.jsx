import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Expand, Search, Info } from 'lucide-react';
import api from '../services/api';
import GraphVisualization from '../components/GraphVisualization';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { getNodeColor } from '../utils/graphUtils';

export default function GraphExplorer() {
  const [searchParams] = useSearchParams();
  const initialNode = searchParams.get('node');

  const [developers, setDevelopers] = useState([]);
  const [selectedId, setSelectedId] = useState(initialNode || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    api.developers()
      .then(setDevelopers)
      .catch(() => {})
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    if (initialNode) loadGraph(initialNode);
  }, [initialNode]);

  const loadGraph = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.graph(id);
      setGraphData(data);
      setSelectedId(id);
      const center = data.nodes.find((n) => n.id === id);
      if (center) setSelectedNode(center);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const expandNode = async (node) => {
    setLoading(true);
    try {
      const expanded = await api.graph(node.id, { expand: 'true' });
      const existingIds = new Set(graphData.nodes.map((n) => n.id));
      const newNodes = expanded.nodes.filter((n) => !existingIds.has(n.id));
      const existingLinks = new Set(graphData.links.map((l) => `${l.source}-${l.target}-${l.type}`));
      const newLinks = expanded.links.filter(
        (l) => !existingLinks.has(`${l.source}-${l.target}-${l.type}`)
      );

      setGraphData((prev) => ({
        nodes: [...prev.nodes, ...newNodes],
        links: [...prev.links, ...newLinks],
      }));
      setSelectedNode(node);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const resetGraph = () => {
    setGraphData({ nodes: [], links: [] });
    setSelectedNode(null);
    setSelectedId('');
    setError(null);
  };

  const filteredDevs = developers.filter((d) =>
    !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Graph Explorer</h1>
        <p className="mt-1 text-gray-400">
          Visualize and traverse the developer knowledge graph
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <div className="card">
            <h2 className="mb-3 text-sm font-semibold text-gray-300">Select Starting Node</h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes..."
                className="input pl-10 text-sm"
              />
            </div>

            {listLoading ? (
              <LoadingSpinner size="sm" message="Loading..." />
            ) : (
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {filteredDevs.map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => loadGraph(dev.id)}
                    disabled={loading}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      selectedId === dev.id
                        ? 'bg-accent/20 text-accent'
                        : 'text-gray-400 hover:bg-surface-border/50 hover:text-gray-200'
                    }`}
                  >
                    {dev.name}
                    <span className="ml-1 text-xs text-gray-500">Developer</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-semibold text-gray-300">Legend</h2>
            <div className="space-y-2">
              {['Developer', 'Project', 'Technology', 'Company', 'Team', 'Skill', 'Role'].map((label) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getNodeColor(label) }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={resetGraph} className="btn-secondary flex-1 text-sm">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            {selectedNode && (
              <button
                onClick={() => expandNode(selectedNode)}
                disabled={loading}
                className="btn-primary flex-1 text-sm"
              >
                <Expand className="h-4 w-4" /> Expand
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card min-h-[500px] p-0 overflow-hidden">
            {loading && !graphData.nodes.length && (
              <LoadingSpinner message="Loading graph data..." />
            )}
            {error && <ErrorMessage message={error} onRetry={() => loadGraph(selectedId)} />}
            {!loading && !error && !graphData.nodes.length && (
              <EmptyState
                title="No graph loaded"
                message="Select a developer from the panel to visualize their connections."
              />
            )}
            {graphData.nodes.length > 0 && (
              <GraphVisualization
                graphData={graphData}
                onNodeClick={handleNodeClick}
                width={Math.min(window.innerWidth - 80, 900)}
                height={500}
              />
            )}
          </div>

          {selectedNode && (
            <div className="mt-4 card">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-accent" />
                <h2 className="font-semibold text-gray-200">Selected Node</h2>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <span><strong className="text-gray-400">Name:</strong> {selectedNode.name}</span>
                <span><strong className="text-gray-400">Type:</strong> {selectedNode.label}</span>
                <span><strong className="text-gray-400">ID:</strong> <code className="font-mono text-xs">{selectedNode.id}</code></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
