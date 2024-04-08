import React from 'react';

import CursorSVG from "@/public/assets/CursorSVG";

type Props = {
  color: string;
  x: number;
  y: number;
  message: string;
};

const Cursor = ({ color, x, y, message }: Props) => {
  return (
    <div style={{ transform: `translateX(${x}px) translateY(${y}px)` }} className="pointer-events-none absolute top-0 left-0">
      <CursorSVG color={color} />

      {message && (
        <div style={{backgroundColor: color}} className="absolute left-2 top-5 rounded-3xl px-4 py-2">
          <p className="text-white whitespace-nowrap text-sm leading-relaxed">{message}</p>
        </div>

      )}
    </div>
  );
};

export default Cursor;