import React from 'react';

import { RightSidebarProps } from "@/types/type";
import { modifyShape } from "@/lib/shapes";
import Dimensions from "./settings/Dimensions";
import Text from "./settings/Text";
import Color from "./settings/Color";
import Export from "./settings/Export";

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage }: RightSidebarProps) => {
  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;    //set (manual) editing to true (user edits an element via the right sidebar)
   
    setElementAttributes(prev => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage
    });
  };

  return (
    <section className="right-sidebar">
      <h3 className="px-5 pt-4 text-sm uppercase">Design</h3>
      <span className="text-[0.8rem] text-primary-grey-300 border-b border-primary-grey-200 mt-3 px-5 pb-4">
        Customize the canvas as you like
      </span>

      <Dimensions
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
        isEditingRef={isEditingRef}
      />
      <Text />
      <Color />
      <Color />    {/* This one is used to handle the stroke color */}
      <Export />
    </section>
  );
};

export default RightSidebar;