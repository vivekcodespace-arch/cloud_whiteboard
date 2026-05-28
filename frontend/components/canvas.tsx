'use client';

import { useRef, useState, useEffect } from 'react';

export default function Canvas() {

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const ctxRef =
    useRef<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [color, setColor] =
    useState('#000000');

  const [brushSize, setBrushSize] =
    useState(2);

  const CANVAS_W = 4000;
  const CANVAS_H = 4000;

  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext('2d');

    if (!ctx) return;

    const dpr =
      window.devicePixelRatio || 1;

    // Big scrollable canvas

    canvas.style.width =
      `${CANVAS_W}px`;

    canvas.style.height =
      `${CANVAS_H}px`;

    canvas.width = CANVAS_W * dpr;

    canvas.height = CANVAS_H * dpr;

    ctx.scale(dpr, dpr);

    ctx.lineWidth = brushSize;

    ctx.lineCap = 'round';

    ctx.strokeStyle = color;

    ctxRef.current = ctx;

  }, []);

  // Update brush color + size dynamically

  useEffect(() => {

    const ctx = ctxRef.current;

    if (!ctx) return;

    ctx.strokeStyle = color;

    ctx.lineWidth = brushSize;

  }, [color, brushSize]);

  const getPos = (
    e: React.MouseEvent
  ) => {

    const canvas = canvasRef.current!;

    const rect =
      canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent
  ) => {

    const ctx = ctxRef.current;

    if (!ctx) return;

    const { x, y } = getPos(e);

    ctx.beginPath();

    ctx.moveTo(x, y);

    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent
  ) => {

    if (!isDrawing) return;

    const ctx = ctxRef.current;

    if (!ctx) return;

    const { x, y } = getPos(e);

    ctx.lineTo(x, y);

    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear board

  const clearBoard = () => {

    const canvas = canvasRef.current;

    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  return (

    <div className="w-screen h-screen overflow-auto bg-gray-100">

      {/* Toolbar */}

      <div
        className="
          fixed
          top-4
          left-4
          z-50
          flex
          items-center
          gap-4
          bg-white
          p-4
          rounded-xl
          shadow-lg
          border
        "
      >

        {/* Color Picker */}

        <div className="flex flex-col">

          <label className="text-sm">
            Color
          </label>

          <input
            type="color"
            value={color}
            onChange={(e) =>
              setColor(e.target.value)
            }
            className="
              w-10
              h-10
              cursor-pointer
            "
          />
        </div>

        {/* Brush Size */}

        <div className="flex flex-col">

          <label className="text-sm">
            Brush: {brushSize}px
          </label>

          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) =>
              setBrushSize(
                Number(e.target.value)
              )
            }
          />
        </div>

        {/* Clear Button */}

        <button
          onClick={clearBoard}
          className="
            bg-red-500
            text-white
            px-4
            py-2
            rounded-lg
            hover:opacity-90
          "
        >
          Clear
        </button>

      </div>

      {/* Canvas */}

      <canvas
        ref={canvasRef}
        className="bg-white block"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

    </div>
  );
}