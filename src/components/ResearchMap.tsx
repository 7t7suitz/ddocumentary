import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Plus, Minus, Move, Trash2, 
  FileText, AlertCircle, Users, Clock,
  Edit3, Save, Download, Share2
} from 'lucide-react';
import { ResearchProject, ResearchMap as ResearchMapType, ResearchNode, NodeConnection } from '../types/research';
import { Chart } from 'chart.js/auto';

interface ResearchMapProps {
  project: ResearchProject;
}

export const ResearchMap: React.FC<ResearchMapProps> = ({
  project
}) => {
  const [map, setMap] = useState<ResearchMapType | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize a default map if none exists
    if (!map) {
      const newMap: ResearchMapType = {
        id: `map-${Date.now()}`,
        title: 'Research Connections Map',
        description: 'Visual map of research connections and relationships',
        nodes: generateNodesFromProject(project),
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setMap(newMap);
    }
  }, [project]);

  useEffect(() => {
    if (map && canvasRef.current) {
      drawMap();
    }
  }, [map, zoom, offset, selectedNode, connectionStart]);

  const generateNodesFromProject = (project: ResearchProject): ResearchNode[] => {
    const nodes: ResearchNode[] = [];
    
    // Add topic nodes
    project.topics.forEach((topic, index) => {
      nodes.push({
        id: `node-topic-${topic.id}`,
        type: 'topic',
        title: topic.name,
        description: topic.description,
        itemId: topic.id,
        position: { x: 100 + (index * 150), y: 100 },
        size: 'medium',
        color: '#3B82F6' // blue
      });
    });
    
    // Add source nodes
    project.sources.forEach((source, index) => {
      nodes.push({
        id: `node-source-${source.id}`,
        type: 'source',
        title: source.title,
        description: source.summary,
        itemId: source.id,
        position: { x: 150 + (index * 120), y: 250 },
        size: 'medium',
        color: '#10B981' // green
      });
    });
    
    // Add claim nodes
    project.claims.forEach((claim, index) => {
      nodes.push({
        id: `node-claim-${claim.id}`,
        type: 'claim',
        title: claim.statement.substring(0, 30) + (claim.statement.length > 30 ? '...' : ''),
        description: claim.statement,
        itemId: claim.id,
        position: { x: 200 + (index * 150), y: 400 },
        size: 'medium',
        color: '#F59E0B' // amber
      });
    });
    
    // Add expert nodes
    project.experts.forEach((expert, index) => {
      nodes.push({
        id: `node-expert-${expert.id}`,
        type: 'expert',
        title: expert.name,
        description: expert.title,
        itemId: expert.id,
        position: { x: 300 + (index * 180), y: 550 },
        size: 'medium',
        color: '#8B5CF6' // purple
      });
    });
    
    return nodes;
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    map.connections.forEach(connection => {
      drawConnection(ctx, connection);
    });
    
    // Draw nodes
    map.nodes.forEach(node => {
      drawNode(ctx, node);
    });
    
    // Draw connection in progress
    if (isCreatingConnection && connectionStart) {
      const startNode = map.nodes.find(node => node.id === connectionStart);
      if (startNode) {
        const mousePos = { x: dragStart.x, y: dragStart.y };
        ctx.beginPath();
        ctx.moveTo(
          startNode.position.x * zoom + offset.x,
          startNode.position.y * zoom + offset.y
        );
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: ResearchNode) => {
    const x = node.position.x * zoom + offset.x;
    const y = node.position.y * zoom + offset.y;
    const radius = getNodeRadius(node.size) * zoom;
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    
    // Highlight selected node
    if (selectedNode === node.id || connectionStart === node.id) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw node label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${12 * zoom}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.title.substring(0, 15), x, y);
    
    // Draw node type indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${8 * zoom}px Arial`;
    ctx.fillText(node.type, x, y + radius + 12);
  };

  const drawConnection = (ctx: CanvasRenderingContext2D, connection: NodeConnection) => {
    const sourceNode = map?.nodes.find(node => node.id === connection.sourceNodeId);
    const targetNode = map?.nodes.find(node => node.id === connection.targetNodeId);
    
    if (!sourceNode || !targetNode) return;
    
    const sourceX = sourceNode.position.x * zoom + offset.x;
    const sourceY = sourceNode.position.y * zoom + offset.y;
    const targetX = targetNode.position.x * zoom + offset.x;
    const targetY = targetNode.position.y * zoom + offset.y;
    
    // Calculate direction vector
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction vector
    const ndx = dx / length;
    const ndy = dy / length;
    
    // Calculate start and end points (adjusted for node radius)
    const sourceRadius = getNodeRadius(sourceNode.size) * zoom;
    const targetRadius = getNodeRadius(targetNode.size) * zoom;
    
    const startX = sourceX + ndx * sourceRadius;
    const startY = sourceY + ndy * sourceRadius;
    const endX = targetX - ndx * targetRadius;
    const endY = targetY - ndy * targetRadius;
    
    // Draw connection line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    
    // Set line style based on connection type
    switch (connection.type) {
      case 'supports':
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)'; // green
        break;
      case 'contradicts':
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // red
        break;
      case 'relates':
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)'; // blue
        break;
      case 'cites':
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)'; // purple
        break;
      default:
        ctx.strokeStyle = 'rgba(107, 114, 128, 0.7)'; // gray
    }
    
    ctx.lineWidth = 2 * zoom * connection.strength;
    ctx.stroke();
    
    // Draw arrow at the end
    const arrowSize = 8 * zoom;
    const angle = Math.atan2(endY - startY, endX - startX);
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI / 6),
      endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI / 6),
      endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    
    // Draw connection label
    if (connection.label) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(midX - 40, midY - 10, 80, 20);
      ctx.strokeStyle = ctx.strokeStyle;
      ctx.strokeRect(midX - 40, midY - 10, 80, 20);
      
      ctx.fillStyle = '#000000';
      ctx.font = `${10 * zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(connection.label, midX, midY);
    }
  };

  const getNodeRadius = (size: string): number => {
    switch (size) {
      case 'small': return 15;
      case 'large': return 30;
      default: return 20; // medium
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a node
    const clickedNode = map.nodes.find(node => {
      const nodeX = node.position.x * zoom + offset.x;
      const nodeY = node.position.y * zoom + offset.y;
      const radius = getNodeRadius(node.size) * zoom;
      
      const distance = Math.sqrt(Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2));
      return distance <= radius;
    });
    
    if (clickedNode) {
      if (isCreatingConnection) {
        if (connectionStart && connectionStart !== clickedNode.id) {
          // Complete connection
          const newConnection: NodeConnection = {
            id: `connection-${Date.now()}`,
            sourceNodeId: connectionStart,
            targetNodeId: clickedNode.id,
            type: 'relates',
            strength: 0.7,
            label: 'Related'
          };
          
          setMap({
            ...map,
            connections: [...map.connections, newConnection]
          });
          
          setIsCreatingConnection(false);
          setConnectionStart(null);
        } else {
          // Start connection
          setConnectionStart(clickedNode.id);
        }
      } else {
        // Select node
        setSelectedNode(clickedNode.id);
      }
    } else {
      // Start dragging the canvas
      setIsDragging(true);
      setDragStart({ x, y });
      setSelectedNode(null);
      
      if (isCreatingConnection) {
        setIsCreatingConnection(false);
        setConnectionStart(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      setOffset({
        x: offset.x + dx,
        y: offset.y + dy
      });
      
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const toggleConnectionMode = () => {
    setIsCreatingConnection(!isCreatingConnection);
    if (isCreatingConnection) {
      setConnectionStart(null);
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'topic': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'source': return <FileText className="w-4 h-4 text-green-500" />;
      case 'claim': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'expert': return <Users className="w-4 h-4 text-purple-500" />;
      case 'event': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <Globe className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Research Map
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Visual map of connections between research elements
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleConnectionMode}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg
              ${isCreatingConnection
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }
            `}
          >
            <span>{isCreatingConnection ? 'Cancel Connection' : 'Create Connection'}</span>
          </button>
          
          <button
            onClick={() => {}}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export Map</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4" ref={containerRef}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            
            <button
              onClick={handleZoomOut}
              className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Minus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            
            <button
              onClick={handleResetView}
              className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Move className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Zoom: {Math.round(zoom * 100)}%
            </div>
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {map?.nodes.length || 0} nodes • {map?.connections.length || 0} connections
          </div>
        </div>
        
        <div className="relative border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full cursor-move"
          />
          
          {isCreatingConnection && (
            <div className="absolute top-4 left-4 right-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
              {connectionStart 
                ? 'Now click on another node to create a connection' 
                : 'Click on a node to start creating a connection'}
            </div>
          )}
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && map && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          {(() => {
            const node = map.nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getNodeTypeIcon(node.type)}
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {node.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Delete node and its connections
                        setMap({
                          ...map,
                          nodes: map.nodes.filter(n => n.id !== selectedNode),
                          connections: map.connections.filter(c => 
                            c.sourceNodeId !== selectedNode && c.targetNodeId !== selectedNode
                          )
                        });
                        setSelectedNode(null);
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {node.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Type
                      </label>
                      <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {node.type}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Size
                      </label>
                      <select
                        value={node.size}
                        onChange={(e) => {
                          const updatedNodes = map.nodes.map(n => 
                            n.id === selectedNode ? { ...n, size: e.target.value as any } : n
                          );
                          setMap({ ...map, nodes: updatedNodes });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={node.color}
                        onChange={(e) => {
                          const updatedNodes = map.nodes.map(n => 
                            n.id === selectedNode ? { ...n, color: e.target.value } : n
                          );
                          setMap({ ...map, nodes: updatedNodes });
                        }}
                        className="w-10 h-10 border-0 p-0 rounded"
                      />
                      <input
                        type="text"
                        value={node.color}
                        onChange={(e) => {
                          const updatedNodes = map.nodes.map(n => 
                            n.id === selectedNode ? { ...n, color: e.target.value } : n
                          );
                          setMap({ ...map, nodes: updatedNodes });
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Connections
                    </label>
                    <div className="space-y-2">
                      {map.connections
                        .filter(c => c.sourceNodeId === selectedNode || c.targetNodeId === selectedNode)
                        .map((connection) => {
                          const otherNodeId = connection.sourceNodeId === selectedNode 
                            ? connection.targetNodeId 
                            : connection.sourceNodeId;
                          const otherNode = map.nodes.find(n => n.id === otherNodeId);
                          const direction = connection.sourceNodeId === selectedNode ? 'to' : 'from';
                          
                          return (
                            <div key={connection.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                              <div className="flex items-center space-x-2">
                                {getNodeTypeIcon(otherNode?.type || 'topic')}
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {direction === 'to' ? 'To: ' : 'From: '}
                                  {otherNode?.title || 'Unknown'}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                                  {connection.type}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setMap({
                                    ...map,
                                    connections: map.connections.filter(c => c.id !== connection.id)
                                  });
                                }}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          );
                        })}
                      
                      {map.connections.filter(c => c.sourceNodeId === selectedNode || c.targetNodeId === selectedNode).length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                          No connections for this node
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Map Legend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Map Legend
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-slate-700 dark:text-slate-300">Topic</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-700 dark:text-slate-300">Source</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-sm text-slate-700 dark:text-slate-300">Claim</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-sm text-slate-700 dark:text-slate-300">Expert</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-700 dark:text-slate-300">Event</span>
          </div>
        </div>
        
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Connection Types
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span className="text-sm text-slate-700 dark:text-slate-300">Supports</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-red-500"></div>
              <span className="text-sm text-slate-700 dark:text-slate-300">Contradicts</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-sm text-slate-700 dark:text-slate-300">Relates</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-purple-500"></div>
              <span className="text-sm text-slate-700 dark:text-slate-300">Cites</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Usage Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Research Map Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Drag the canvas to navigate the map</li>
          <li>• Use the zoom controls to adjust the view</li>
          <li>• Click on nodes to view and edit their details</li>
          <li>• Create connections to show relationships between research elements</li>
          <li>• Arrange nodes by dragging them to meaningful positions</li>
          <li>• Use the map to identify gaps in your research</li>
        </ul>
      </div>
    </div>
  );
};