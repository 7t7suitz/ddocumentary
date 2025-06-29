import React, { useRef, useEffect, useState } from 'react';
import { StoryboardFrame, Character, VisualElement } from '../types';
import { Move, RotateCcw, Palette, Camera, Users, Clock } from 'lucide-react';

interface StoryboardCanvasProps {
  frame: StoryboardFrame;
  onFrameUpdate: (frame: StoryboardFrame) => void;
  aspectRatio: string;
  isEditing: boolean;
}

export const StoryboardCanvas: React.FC<StoryboardCanvasProps> = ({
  frame,
  onFrameUpdate,
  aspectRatio,
  isEditing
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const aspectRatios = {
    '16:9': { width: 400, height: 225 },
    '4:3': { width: 400, height: 300 },
    '21:9': { width: 400, height: 171 },
    '1:1': { width: 400, height: 400 },
    '9:16': { width: 225, height: 400 }
  };

  const canvasSize = aspectRatios[aspectRatio as keyof typeof aspectRatios] || aspectRatios['16:9'];

  useEffect(() => {
    drawFrame();
  }, [frame, selectedElement]);

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, frame.colorPalette.background);
    gradient.addColorStop(1, adjustBrightness(frame.colorPalette.background, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lighting overlay
    drawLightingOverlay(ctx, canvas.width, canvas.height);

    // Draw characters
    frame.characters.forEach(character => {
      drawCharacter(ctx, character, canvas.width, canvas.height);
    });

    // Draw visual elements
    frame.visualElements.forEach(element => {
      drawVisualElement(ctx, element, canvas.width, canvas.height);
    });

    // Draw frame border
    ctx.strokeStyle = frame.colorPalette.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw shot type indicator
    drawShotTypeIndicator(ctx, canvas.width, canvas.height);

    // Draw camera movement indicator
    drawCameraMovementIndicator(ctx, canvas.width, canvas.height);
  };

  const drawLightingOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { lighting } = frame;
    
    // Create lighting gradient based on mood
    let overlayColor = 'rgba(255, 255, 255, 0.1)';
    
    switch (lighting.mood) {
      case 'dramatic':
        overlayColor = 'rgba(0, 0, 0, 0.3)';
        break;
      case 'moody':
        overlayColor = 'rgba(0, 0, 0, 0.2)';
        break;
      case 'bright':
        overlayColor = 'rgba(255, 255, 255, 0.2)';
        break;
      case 'dim':
        overlayColor = 'rgba(0, 0, 0, 0.1)';
        break;
    }

    // Apply time of day tint
    switch (lighting.timeOfDay) {
      case 'dawn':
      case 'dusk':
        ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        break;
      case 'night':
        ctx.fillStyle = 'rgba(0, 0, 100, 0.2)';
        ctx.fillRect(0, 0, width, height);
        break;
      case 'golden-hour':
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
        break;
    }

    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);
  };

  const drawCharacter = (ctx: CanvasRenderingContext2D, character: Character, canvasWidth: number, canvasHeight: number) => {
    const x = (character.position.x / 100) * canvasWidth;
    const y = (character.position.y / 100) * canvasHeight;
    const size = character.size * 30;

    // Draw character as simple figure
    ctx.fillStyle = frame.colorPalette.primary;
    ctx.strokeStyle = selectedElement === character.id ? '#FFD700' : frame.colorPalette.accent;
    ctx.lineWidth = selectedElement === character.id ? 3 : 1;

    // Head
    ctx.beginPath();
    ctx.arc(x, y - size * 0.7, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.rect(x - size * 0.1, y - size * 0.5, size * 0.2, size * 0.4);
    ctx.fill();
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.rect(x - size * 0.2, y - size * 0.4, size * 0.4, size * 0.1);
    ctx.fill();
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.rect(x - size * 0.1, y - size * 0.1, size * 0.08, size * 0.3);
    ctx.rect(x + size * 0.02, y - size * 0.1, size * 0.08, size * 0.3);
    ctx.fill();
    ctx.stroke();

    // Character label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(character.name, x, y + size * 0.4);
  };

  const drawVisualElement = (ctx: CanvasRenderingContext2D, element: VisualElement, canvasWidth: number, canvasHeight: number) => {
    const x = (element.position.x / 100) * canvasWidth;
    const y = (element.position.y / 100) * canvasHeight;
    const size = element.size * 20;

    ctx.fillStyle = frame.colorPalette.secondary;
    ctx.strokeStyle = selectedElement === element.id ? '#FFD700' : frame.colorPalette.accent;
    ctx.lineWidth = selectedElement === element.id ? 3 : 1;

    switch (element.type) {
      case 'prop':
        ctx.beginPath();
        ctx.rect(x - size/2, y - size/2, size, size);
        ctx.fill();
        ctx.stroke();
        break;
      case 'background':
        ctx.beginPath();
        ctx.rect(x - size, y - size/2, size * 2, size);
        ctx.fill();
        ctx.stroke();
        break;
      case 'text':
        ctx.fillStyle = '#333';
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(element.content, x, y);
        break;
    }
  };

  const drawShotTypeIndicator = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const shotTypeFrames = {
      'extreme-wide': { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
      'wide': { x: 0.15, y: 0.15, w: 0.7, h: 0.7 },
      'medium-wide': { x: 0.2, y: 0.2, w: 0.6, h: 0.6 },
      'medium': { x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
      'medium-close': { x: 0.3, y: 0.3, w: 0.4, h: 0.4 },
      'close-up': { x: 0.35, y: 0.35, w: 0.3, h: 0.3 },
      'extreme-close-up': { x: 0.4, y: 0.4, w: 0.2, h: 0.2 }
    };

    const frameData = shotTypeFrames[frame.shotType as keyof typeof shotTypeFrames];
    if (frameData) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        frameData.x * width,
        frameData.y * height,
        frameData.w * width,
        frameData.h * height
      );
      ctx.setLineDash([]);
    }
  };

  const drawCameraMovementIndicator = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (frame.cameraMovement === 'static') return;

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);

    const centerX = width / 2;
    const centerY = height / 2;

    switch (frame.cameraMovement) {
      case 'pan-left':
        ctx.beginPath();
        ctx.moveTo(centerX + 50, centerY);
        ctx.lineTo(centerX - 50, centerY);
        ctx.stroke();
        drawArrow(ctx, centerX - 50, centerY, -1, 0);
        break;
      case 'pan-right':
        ctx.beginPath();
        ctx.moveTo(centerX - 50, centerY);
        ctx.lineTo(centerX + 50, centerY);
        ctx.stroke();
        drawArrow(ctx, centerX + 50, centerY, 1, 0);
        break;
      case 'zoom-in':
        ctx.beginPath();
        ctx.rect(centerX - 30, centerY - 30, 60, 60);
        ctx.rect(centerX - 15, centerY - 15, 30, 30);
        ctx.stroke();
        break;
      case 'zoom-out':
        ctx.beginPath();
        ctx.rect(centerX - 15, centerY - 15, 30, 30);
        ctx.rect(centerX - 30, centerY - 30, 60, 60);
        ctx.stroke();
        break;
    }

    ctx.setLineDash([]);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, dirX: number, dirY: number) => {
    const arrowSize = 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - dirX * arrowSize - dirY * arrowSize/2, y - dirY * arrowSize + dirX * arrowSize/2);
    ctx.moveTo(x, y);
    ctx.lineTo(x - dirX * arrowSize + dirY * arrowSize/2, y - dirY * arrowSize - dirX * arrowSize/2);
    ctx.stroke();
  };

  const adjustBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / canvas.offsetWidth) * 100;
    const y = ((event.clientY - rect.top) / canvas.offsetHeight) * 100;

    // Check if clicking on existing element
    const clickedCharacter = frame.characters.find(char => {
      const charX = char.position.x;
      const charY = char.position.y;
      return Math.abs(x - charX) < 10 && Math.abs(y - charY) < 10;
    });

    if (clickedCharacter) {
      setSelectedElement(clickedCharacter.id);
    } else {
      setSelectedElement(null);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing || !selectedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / canvas.offsetWidth) * 100;
    const y = ((event.clientY - rect.top) / canvas.offsetHeight) * 100;

    const element = frame.characters.find(char => char.id === selectedElement);
    if (element) {
      setDragOffset({
        x: x - element.position.x,
        y: y - element.position.y
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / canvas.offsetWidth) * 100;
    const y = ((event.clientY - rect.top) / canvas.offsetHeight) * 100;

    const updatedFrame = {
      ...frame,
      characters: frame.characters.map(char =>
        char.id === selectedElement
          ? {
              ...char,
              position: {
                x: Math.max(5, Math.min(95, x - dragOffset.x)),
                y: Math.max(5, Math.min(95, y - dragOffset.y))
              }
            }
          : char
      )
    };

    onFrameUpdate(updatedFrame);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`border-2 border-slate-300 dark:border-slate-600 rounded-lg ${
          isEditing ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Frame Info Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
        <div className="flex items-center space-x-2">
          <Camera className="w-3 h-3" />
          <span>{frame.shotType}</span>
          <span>•</span>
          <span>{frame.cameraAngle}</span>
          {frame.cameraMovement !== 'static' && (
            <>
              <span>•</span>
              <Move className="w-3 h-3" />
              <span>{frame.cameraMovement}</span>
            </>
          )}
        </div>
      </div>

      {/* Duration Indicator */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{frame.duration}s</span>
        </div>
      </div>

      {/* Character Count */}
      {frame.characters.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{frame.characters.length}</span>
          </div>
        </div>
      )}

      {/* Color Palette Indicator */}
      <div className="absolute bottom-2 right-2 flex space-x-1">
        <div
          className="w-4 h-4 rounded border border-white"
          style={{ backgroundColor: frame.colorPalette.primary }}
        />
        <div
          className="w-4 h-4 rounded border border-white"
          style={{ backgroundColor: frame.colorPalette.secondary }}
        />
        <div
          className="w-4 h-4 rounded border border-white"
          style={{ backgroundColor: frame.colorPalette.accent }}
        />
      </div>
    </div>
  );
};