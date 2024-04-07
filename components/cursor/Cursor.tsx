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

      {/* TODO: MESSAGE */}
    </div>
  );
};

export default Cursor;