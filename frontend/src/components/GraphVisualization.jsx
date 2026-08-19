import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getNodeColor } from '../utils/graphUtils';

export default function GraphVisualization({ graphData, onNodeClick, width, height }) {
  const fgRef = useRef();
  const [hoverNode, setHoverNode] = useState(null);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-200);
      fgRef.current.d3Force('link').distance(80);
    }
  }, [graphData]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.name || node.id;
    const fontSize = 12 / globalScale;
    const nodeRadius = 6;

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = getNodeColor(node.label);
    ctx.fill();
    ctx.strokeStyle = hoverNode === node ? '#ffffff' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = hoverNode === node ? 2 : 1;
    ctx.stroke();

    if (globalScale > 0.6 || hoverNode === node) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#e5e7eb';
      ctx.fillText(label, node.x, node.y + nodeRadius + 2);
    }
  }, [hoverNode]);

  if (!graphData?.nodes?.length) return null;

  const data = {
    nodes: graphData.nodes.map((n) => ({ ...n })),
    links: graphData.links.map((l) => ({
      source: l.source,
      target: l.target,
      type: l.type,
    })),
  };

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      width={width}
      height={height}
      nodeLabel={(node) => `${node.label}: ${node.name}`}
      linkLabel={(link) => link.type}
      linkColor={() => 'rgba(100,116,139,0.5)'}
      linkWidth={1.5}
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      nodeCanvasObject={paintNode}
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }}
      onNodeClick={onNodeClick}
      onNodeHover={setHoverNode}
      cooldownTicks={100}
    />
  );
}
