'use client';
import { useRef, useState, useEffect } from 'react';

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvasRef.current?.getContext('2d');
    if(!ctx) return;
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctxRef.current = ctx;
    
    // nice work man
    
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    // const ctx = canvasRef.current?.getContext('2d');
    // if () return;
    ctxRef.current?.beginPath(); //Creates new path, if this is removed old lines get conntected
    ctxRef.current?.moveTo(e.clientX, e.clientY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    // const ctx = canvasRef.current?.getContext('2d');
    // if (!ctx) return;
    ctxRef.current?.lineTo(e.clientX, e.clientY);
    ctxRef.current?.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      className="bg-white cursor-crosshair"
    />
  );
}