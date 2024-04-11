'use client';
import { useEffect, useRef, useState } from "react";
import { fabric } from 'fabric';

import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Live from "@/components/Live";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { ActiveElement } from "@/types/type";
import { useMutation, useStorage } from "@/liveblocks.config";
import { defaultNavElement } from "@/constants";
import { handleDelete } from "@/lib/key-events";

export default function Page() {
  /** canvasRef is a reference to the canvas element that we'll use to initialize the fabric canvas. */
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** fabricRef is a reference to the fabric canvas that we use to perform operations on the canvas.
  * It's a copy of the created canvas so we can use it outside the canvas event listeners. */
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);

  const canvasObjects = useStorage(root => root.canvasObjects);

  /**
  * syncShapeInStorage is a mutation that syncs the shape in the key-value store of liveblocks.
  *
  * We're using this mutation to sync the shape in the key-value store
  * whenever user performs any action on the canvas such as drawing, moving editing, deleting etc.
  */
  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.set(objectId, shapeData);
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({ name: '', value: '', icon: '' });

  /**
   * deleteAllShapes is a mutation that deletes all shapes from the key-value store of liveblocks.
   *
   * delete: https://liveblocks.io/docs/api-reference/liveblocks-client#LiveMap.delete
   * get: https://liveblocks.io/docs/api-reference/liveblocks-client#LiveMap.get
   *
   * We're using this mutation to delete all the shapes from the key-value store when the user clicks on the reset button.
   */
  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get('canvasObjects');
    if (!canvasObjects || canvasObjects.size === 0) return true;

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }
    return canvasObjects.size === 0;
  }, []);

  /**
  * deleteShapeFromStorage is a mutation that deletes a shape from the
  * key-value store of liveblocks.
  * useMutation is a hook provided by Liveblocks that allows you to perform
  * mutations on liveblocks data.
  *
  * useMutation: https://liveblocks.io/docs/api-reference/liveblocks-react#useMutation
  * delete: https://liveblocks.io/docs/api-reference/liveblocks-client#LiveMap.delete
  * get: https://liveblocks.io/docs/api-reference/liveblocks-client#LiveMap.get
  *
  * We're using this mutation to delete a shape from the key-value store when
  * the user deletes a shape from the canvas.
  */
  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    /**
    * canvasObjects is a Map that contains all the shapes in the key-value.
    * Like a store. We can create multiple stores in liveblocks.
    *
    * delete: https://liveblocks.io/docs/api-reference/liveblocks-client#LiveMap.delete
    */
    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (el: ActiveElement) => {
    setActiveElement(el);

    switch (el?.value) {
      case 'reset':      // delete all shapes from the canvas
        deleteAllShapes();      // clear the storage
        fabricRef.current?.clear();      // clear the canvas
        setActiveElement(defaultNavElement);      // set "select" as the active element
        break;

      case 'delete':      // delete the selected shape from the canvas
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;

      default:
        break;
    }
    selectedShapeRef.current = el?.value as string;
  };

  useEffect(() => {
    const canvas = initializeFabric({ fabricRef, canvasRef });

    canvas.on('mouse:down', (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef
      });
    });

    canvas.on('mouse:move', (options) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage
      });
    });

    canvas.on('mouse:up', () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        activeObjectRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement
      });
    });

    canvas.on('object:modified', (options) => {
      handleCanvasObjectModified({ options, syncShapeInStorage });
    });

    window.addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current });
    });

    return () => { canvas.dispose(); };
  }, [canvasRef]);

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);

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