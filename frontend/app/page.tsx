'use client';

import UseCanvas from '@/components/canvas/useCanvas';

export default function Whiteboard() {
  return (
    <div className="w-screen h-screen bg-gray-100">
      <UseCanvas />
    </div>
  );
}