'use client';

import { useParams } from 'next/navigation';
import UseCanvas from '@/components/canvas/useCanvas';

export default function Whiteboard() {
  const params = useParams();

  const roomId = params.roomId as string;

  return (
    <div className="w-screen h-screen bg-gray-100">
      <UseCanvas roomId={roomId} />
    </div>
  );
}