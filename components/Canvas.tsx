// Fix: Create `Canvas.tsx` component for drawing.
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { type Stroke, type Point, Tool } from '../types';

interface CanvasProps {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  height: number;
  tool: Tool;
  color: string;
  width: number;
}

// Bounding box calculation
const getStrokesBoundingBox = (strokes: Stroke[]) => {
  if (strokes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  strokes.forEach(stroke => {
    stroke.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });
  return { minX, minY, maxX, maxY };
};

// Point in polygon check (ray-casting algorithm)
const isPointInPolygon = (point: Point, polygon: Point[]) => {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
};


const Canvas: React.FC<CanvasProps> = ({ strokes, onStrokesChange, height, tool, color, width }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [moveStartPoint, setMoveStartPoint] = useState<Point | null>(null);

  const redrawCanvas = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
    
    // Draw current pen stroke in real-time
    if (tool === Tool.Pen && isDrawing && currentPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
            ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }
    
    // Draw lasso selection path in real-time
    if (tool === Tool.Lasso && isDrawing && currentPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
            ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw bounding box for selected strokes
    const selectedStrokes = strokes.filter(s => s.selected);
    if (selectedStrokes.length > 0) {
      const box = getStrokesBoundingBox(selectedStrokes);
      if (box) {
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(box.minX - 5, box.minY - 5, box.maxX - box.minX + 10, box.maxY - box.minY + 10);
        ctx.setLineDash([]);
      }
    }

  }, [strokes, isDrawing, currentPoints, tool, color, width]);
  
  // Resize and initial draw effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width } = canvas.getBoundingClientRect();
      if (width > 0) {
        canvas.width = width;
        canvas.height = height;
        redrawCanvas(ctx);
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [height, redrawCanvas]);

  // Redraw when data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || canvas.width === 0) return;
    redrawCanvas(ctx);
  }, [strokes, currentPoints, redrawCanvas]);


  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getPoint(e);
    
    if (tool === Tool.Lasso) {
        const selectedStrokes = strokes.filter(s => s.selected);
        const box = selectedStrokes.length > 0 ? getStrokesBoundingBox(selectedStrokes) : null;
        if (box && point.x >= box.minX && point.x <= box.maxX && point.y >= box.minY && point.y <= box.maxY) {
            setIsMoving(true);
            setMoveStartPoint(point);
            return;
        }
    }
    
    setIsDrawing(true);
    setCurrentPoints([point]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);
    if (isDrawing) {
        setCurrentPoints(prev => [...prev, point]);
    } else if (isMoving && moveStartPoint) {
        const dx = point.x - moveStartPoint.x;
        const dy = point.y - moveStartPoint.y;
        
        if (dx === 0 && dy === 0) return;

        const movedStrokes = strokes.map(stroke => {
            if (stroke.selected) {
                return {
                    ...stroke,
                    points: stroke.points.map(p => ({...p, x: p.x + dx, y: p.y + dy }))
                };
            }
            return stroke;
        });
        onStrokesChange(movedStrokes);
        // FIX: Update the start point for the next move calculation. This prevents
        // the cumulative delta calculation that made strokes fly off the screen.
        setMoveStartPoint(point);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (isDrawing) {
        setIsDrawing(false);

        if (tool === Tool.Pen && currentPoints.length > 1) {
            const newStroke: Stroke = {
                id: `stroke-${Date.now()}`,
                points: currentPoints,
                color,
                width,
                selected: false,
            };
            onStrokesChange([...strokes.map(s => ({...s, selected: false})), newStroke]);
        }
        
        if (tool === Tool.Lasso && currentPoints.length > 2) {
            const updatedStrokes = strokes.map(stroke => {
                const isSelected = stroke.points.some(point => isPointInPolygon(point, currentPoints));
                return { ...stroke, selected: isSelected };
            });
            onStrokesChange(updatedStrokes);
        }
    }

    if (isMoving) {
        setIsMoving(false);
        setMoveStartPoint(null);
    }

    setCurrentPoints([]);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`touch-none w-full bg-gray-800 ${tool === Tool.Lasso ? 'cursor-crosshair' : 'cursor-crosshair'}`}
      style={{ height: `${height}px` }}
    />
  );
};

export default Canvas;