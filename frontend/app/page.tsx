'use client';

import Canvas from '../components/canvas';

export default function Whiteboard() {
  return (
    <div className="h-screen w-screen bg-[#e3dbcc] flex items-center justify-center ">
      {/* ONLY ONE SCROLL CONTAINER */}
      <div className="h-[95vh] w-[90vw] overflow-auto rounded-xl no-scrollbar">
        <Canvas />
      </div>
    </div>
  );
}