import { fabric } from "fabric";
import { v4 as uuid4 } from "uuid";

import {
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasObjectModified,
  CanvasObjectScaling,
  CanvasPathCreated,
  CanvasSelectionCreated,
  RenderCanvas,
} from "@/types/type";
import { defaultNavElement } from "@/constants";
import { createSpecificShape } from "./shapes";

/**
 * Initialize fabric canvas
 */
export const initializeFabric = ({ fabricRef, canvasRef }: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  const canvasElement = document.getElementById("canvas");  // get canvas element

  const canvas = new fabric.Canvas(canvasRef.current, {  // create fabric canvas
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
  });

  // set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
  fabricRef.current = canvas;

  return canvas;
};


/** 
 * Instantiate creation of custom fabric object/shape and add it to canvas
 */
export const handleCanvasMouseDown = ({ options, canvas, selectedShapeRef, isDrawing, shapeRef }: CanvasMouseDown) => {
  const pointer = canvas.getPointer(options.e);  // get pointer coordinates

  /**
   * get target object i.e., the object that is clicked
   * findtarget() returns the object that is clicked
   *
   * findTarget: http://fabricjs.com/docs/fabric.Canvas.html#findTarget
   */
  const target = canvas.findTarget(options.e, false);
  canvas.isDrawingMode = false;

  if (selectedShapeRef.current === "freeform") {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5;
    return;
  }

  canvas.isDrawingMode = false;

  // if target is the selected shape or active selection, set isDrawing to false
  if (target && (target.type === selectedShapeRef.current || target.type === "activeSelection")) {
    isDrawing.current = false;

    canvas.setActiveObject(target);
    target.setCoords();   // setCoords() is used to update the controls of the object
  } else {
    isDrawing.current = true;

    shapeRef.current = createSpecificShape(selectedShapeRef.current, pointer as any);   // create custom fabric object/shape and set it to shapeRef

    // if shapeRef is not null, add it to canvas
    if (shapeRef.current) {
      canvas.add(shapeRef.current);
    }
  }
};

/**
 * Handle mouse move event on canvas to draw shapes with different dimensions
 */
export const handleCanvaseMouseMove = (
  { options, canvas, isDrawing, selectedShapeRef, shapeRef, syncShapeInStorage, }: CanvasMouseMove
) => {
  if (!isDrawing.current) return;
  if (selectedShapeRef.current === "freeform") return;

  canvas.isDrawingMode = false;
  const pointer = canvas.getPointer(options.e);

  // depending on the selected shape, set the dimensions of the shape stored in shapeRef in previous step of handelCanvasMouseDown
  // calculate shape dimensions based on pointer coordinates
  switch (selectedShapeRef?.current) {
    case "rectangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case "circle":
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;
    case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case "line":
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;
    case "image":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
    default:
      break;
  }

  canvas.renderAll();  // render objects on canvas

  // sync shape in storage
  if (shapeRef.current?.objectId) {
    syncShapeInStorage(shapeRef.current);
  }
};

/**
 * Handle mouse up event on canvas to stop drawing shapes
 */
export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: CanvasMouseUp) => {
  isDrawing.current = false;
  if (selectedShapeRef.current === "freeform") return;

  syncShapeInStorage(shapeRef.current);   // sync shape in storage as drawing is stopped

  shapeRef.current = null;
  activeObjectRef.current = null;
  selectedShapeRef.current = null;

  // if canvas is not in drawing mode, set active element to default nav element after 700ms
  if (!canvas.isDrawingMode) {
    setTimeout(() => { setActiveElement(defaultNavElement) }, 700);
  }
};

// 
/**
 * Update shape in storage when object is modified
 */
export const handleCanvasObjectModified = ({ options, syncShapeInStorage }: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;

  if (target?.type == "activeSelection") {
    // fix this
  } else {
    syncShapeInStorage(target);
  }
};

/**  
 * Update shape in storage when path is created when in freeform mode
 */
export const handlePathCreated = ({ options, syncShapeInStorage }: CanvasPathCreated) => {
  const path = options.path;
  if (!path) return;

  // set unique id to path object
  path.set({ objectId: uuid4() });

  syncShapeInStorage(path);
};

/** 
 * Check how object is moving on canvas and restrict it to canvas boundaries 
 */
export const handleCanvasObjectMoving = ({ options }: { options: fabric.IEvent; }) => {
  const target = options.target as fabric.Object;  // get target object which is moving

  // target.canvas is the canvas on which the object is moving
  const canvas = target.canvas as fabric.Canvas;

  target.setCoords();

  // restrict object to canvas boundaries (horizontal)
  if (target && target.left) {
    target.left = Math.max(0,
      Math.min(target.left, (canvas.width || 0) - (target.getScaledWidth() || target.width || 0)));
  }

  // restrict object to canvas boundaries (vertical)
  if (target && target.top) {
    target.top = Math.max(0,
      Math.min(target.top, (canvas.height || 0) - (target.getScaledHeight() || target.height || 0)));
  }
};

/** 
 * Set element attributes when element is selected
 */
export const handleCanvasSelectionCreated = ({ options, isEditingRef, setElementAttributes }: CanvasSelectionCreated) => {
  if (isEditingRef.current) return;  // if user is editing manually, return
  if (!options?.selected) return;  // if no element is selected, return

  const selectedElement = options?.selected[0] as fabric.Object;

  // if only one element is selected, set element attributes
  if (selectedElement && options.selected.length === 1) {
    // calculate scaled dimensions of the object
    const scaledWidth = selectedElement?.scaleX
      ? selectedElement?.width! * selectedElement?.scaleX
      : selectedElement?.width;

    const scaledHeight = selectedElement?.scaleY
      ? selectedElement?.height! * selectedElement?.scaleY
      : selectedElement?.height;

    setElementAttributes({
      width: scaledWidth?.toFixed(0).toString() || "",
      height: scaledHeight?.toFixed(0).toString() || "",
      fill: selectedElement?.fill?.toString() || "",
      stroke: selectedElement?.stroke || "",
      // @ts-ignore
      fontSize: selectedElement?.fontSize || "",
      // @ts-ignore
      fontFamily: selectedElement?.fontFamily || "",
      // @ts-ignore
      fontWeight: selectedElement?.fontWeight || "",
    });
  }
};

/** 
 * Update element attributes when element is scaled  
 */
export const handleCanvasObjectScaling = ({ options, setElementAttributes }: CanvasObjectScaling) => {
  const selectedElement = options.target;

  // calculate scaled dimensions of the object
  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;

  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;

  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
  }));
};

/**
 * Render canvas objects coming from storage on canvas 
 */
export const renderCanvas = ({ fabricRef, canvasObjects, activeObjectRef }: RenderCanvas) => {
  fabricRef.current?.clear();

  // render all objects on canvas
  Array.from(canvasObjects, ([objectId, objectData]) => {
    /**
     * enlivenObjects() is used to render objects on canvas.
     * 
     * It takes two arguments:
     * 1. objectData: object data to render on canvas
     * 2. callback: callback function to execute after rendering objects on canvas
     *
     * enlivenObjects: http://fabricjs.com/docs/fabric.util.html#.enlivenObjectEnlivables
     */
    fabric.util.enlivenObjects([objectData], (enlivenedObjects: fabric.Object[]) => {
      enlivenedObjects.forEach((obj) => {
        if (activeObjectRef.current?.objectId === objectId) {   // if element is active, keep it in active state so that it can be edited further
          fabricRef.current?.setActiveObject(obj);
        }

        fabricRef.current?.add(obj);   // add object to canvas
      });
    },
      // Specify namespace of the object for fabric to render it on canvas. A namespace is a string that is used to identify the type of object.
      "fabric"
    );
  });

  fabricRef.current?.renderAll();
};


/**
 * Resize canvas dimensions on window resize
 */
export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null; }) => {
  const canvasElement = document.getElementById("canvas");
  if (!canvasElement) return;

  if (!canvas) return;

  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

/** 
 * Zoom canvas on mouse scroll
 */
export const handleCanvasZoom = ({ options, canvas }: {
  options: fabric.IEvent & { e: WheelEvent; };
  canvas: fabric.Canvas;
}) => {
  const delta = options.e?.deltaY;
  let zoom = canvas.getZoom();

  // allow zooming to min 20% and max 100%
  const minZoom = 0.2;
  const maxZoom = 1;
  const zoomStep = 0.001;

  // calculate zoom based on mouse scroll wheel with min and max zoom
  zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);

  // set zoom to canvas    zoomToPoint: http://fabricjs.com/docs/fabric.Canvas.html#zoomToPoint
  canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);

  options.e.preventDefault();
  options.e.stopPropagation();
};
