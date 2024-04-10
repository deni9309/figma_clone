'use client';
import React from 'react';
import Image from "next/image";

import { ShapesMenuProps } from "@/types/type";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef
}: ShapesMenuProps) => {
  const isDropdownElement = item.value.some(element => element?.value === activeElement.value);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring">
          <Button onClick={() => handleActiveElement(item)} className="object-contain relative w-5 h-5">
            <Image src={isDropdownElement ? activeElement.icon : item.icon}
              alt={item.name}
              fill
              className={isDropdownElement ? "invert" : ""}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="flex flex-col gap-y-1 border-none text-white bg-primary-black mt-5 py-4">
          {item.value.map(el => (
            <Button key={el?.name}
              className={`flex justify-between gap-10 rounded-none h-fit px-5 py-3 focus:border-none ${activeElement.value === el?.value ? "bg-primary-green" : "hover:bg-primary-grey-200"}`}
              onClick={() => { handleActiveElement(el); }}
            >
              <div className="group flex items-center gap-2">
                <Image src={el?.icon as string}
                  alt={el?.name as string}
                  width={20}
                  height={20}
                  className={activeElement.value === el?.value ? "invert" : ""}
                />
                <p className={`text-sm ${activeElement.value === el?.value ? "text-primary-black" : "text-white"}`}>
                  {el?.name}
                </p>
              </div>
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input type="file"
        className="hidden"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload} />
    </>
  );
};

export default ShapesMenu;