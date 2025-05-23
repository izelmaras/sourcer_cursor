import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Tag {
  name: string;
  category: string;
}

interface ForceDirectedTagsProps {
  tags: Tag[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'tag' | 'category';
  category?: string;
  radius: number;
  color: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
}

export const ForceDirectedTags = ({ tags, selectedTags, onTagSelect }: ForceDirectedTagsProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create unique categories and nodes
    const categories = Array.from(new Set(tags.map(t => t.category)));
    const categoryNodes: Node[] = categories.map(category => ({
      id: `category-${category}`,
      name: category,
      type: 'category',
      radius: 80,
      color: '#f3f4f6'
    }));

    const tagNodes: Node[] = tags.map(tag => ({
      id: `tag-${tag.name}`,
      name: tag.name,
      type: 'tag',
      category: tag.category,
      radius: 40,
      color: selectedTags.includes(tag.name) ? '#111827' : '#e5e7eb'
    }));

    const nodes = [...categoryNodes, ...tagNodes];
    const links: Link[] = tagNodes.map(tag => ({
      source: tag,
      target: categoryNodes.find(cat => cat.name === tag.category) || categoryNodes[0]
    }));

    // Create SVG
    const svg = d3.select(svgRef.current);
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as Node).radius + 10));

    // Create soft blob shapes
    const generateBlobPoints = (radius: number, irregularity: number = 0.1) => {
      const numPoints = 20;
      const angleStep = (2 * Math.PI) / numPoints;
      const points: [number, number][] = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        const variance = 1 + (Math.random() - 0.5) * irregularity;
        const r = radius * variance;
        points.push([
          r * Math.cos(angle),
          r * Math.sin(angle)
        ]);
      }

      // Close the path
      points.push(points[0]);
      return points;
    };

    const line = d3.line<[number, number]>()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveBasisClosed);

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add blob shapes
    node.append('path')
      .attr('d', d => {
        const points = generateBlobPoints(d.radius, d.type === 'category' ? 0.1 : 0.15);
        return line(points)!;
      })
      .attr('fill', d => d.color)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.5);

    // Add text
    node.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', d => d.type === 'tag' && selectedTags.includes(d.name) ? '#ffffff' : '#111827')
      .attr('font-size', d => d.type === 'category' ? '14px' : '12px')
      .attr('font-weight', d => d.type === 'category' ? '600' : '400')
      .style('pointer-events', 'none');

    // Add click handler for tags
    node.filter(d => d.type === 'tag')
      .on('click', (event, d: Node) => {
        if (d.type === 'tag') {
          onTagSelect(d.name);
        }
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [tags, selectedTags, dimensions, onTagSelect]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-[600px] bg-white rounded-3xl"
      style={{ touchAction: 'none' }}
    />
  );
};