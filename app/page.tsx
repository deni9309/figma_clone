'use client';
import { useEffect, useRef, useState } from "react";
import { fabric } from 'fabric';

import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Live from "@/components/Live";
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/canvas";
import { ActiveElement } from "@/types/type";

export default function Page() {
  /** canvasRef is a reference to the canvas element that we'll use to initialize the fabric canvas. */
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** fabricRef is a reference to the fabric canvas that we use to perform operations on the canvas.
  * It's a copy of the created canvas so we can use it outside the canvas event listeners. */
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>('rectangle');

  const [activeElement, setActiveElement] = useState<ActiveElement>({ name: '', value: '', icon: '' });

  const handleActiveElement = (el:ActiveElement) => { 
    setActiveElement(el);

    selectedShapeRef.current = el?.value as string;
  };

  useEffect(() => {
    const canvas = initializeFabric({ fabricRef, canvasRef });

    canvas.on('mouse:down', (options) => {
      handleCanvasMouseDown({ options, canvas, isDrawing, shapeRef, selectedShapeRef });
    });

    window.addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current });
    });
  }, [canvasRef]);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
      />

      <section className="flex flex-row h-full">
        <LeftSidebar />
        <Live canvasRef={canvasRef} />
        <RightSidebar />
      </section>
    </main>
  );
}