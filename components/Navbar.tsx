'use client';
import React, { memo } from 'react';
import Image from "next/image";

import { ActiveElement, NavbarProps } from "@/types/type";
import ActiveUsers from "./users/ActiveUsers";
import { navElements } from "@/constants";

import { NewThread } from "./comments/NewThread";
import { Button } from "./ui/button";
import ShapesMenu from "./ShapesMenu";

const Navbar = ({ activeElement, imageInputRef, handleImageUpload, handleActiveElement }: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) && value.some(val => val?.value === activeElement?.value));

  return (
    <nav className="flex justify-between items-center gap-4 select-none text-white bg-primary-black px-5">
      <Image src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />
      <ul className="flex flex-row">
        {navElements.map((item: ActiveElement | any) => (
          <li key={item.name}
            className={`flex justify-center items-center group px-2.5 py-5 ${isActive(item.value) ? "bg-primary-green" : "hover:bg-primary-grey-200"}`}
            onClick={() => {
              if (Array.isArray(item.value)) return;
              handleActiveElement(item);
            }}
          >
            {Array.isArray(item.value) ? (
              <ShapesMenu
                item={item}
                activeElement={activeElement}
                imageInputRef={imageInputRef}
                handleActiveElement={handleActiveElement}
                handleImageUpload={handleImageUpload}
              />
            ) : item?.value === 'comments' ? (
              <NewThread>
                <Button className="relative w-5 h-5 object-contain">
                  <Image src={item.icon} alt={item.name} fill className={isActive(item.value) ? "invert" : ""} />
                </Button>
              </NewThread>
            ) : (
              <Button className="relative w-5 h-5 object-contain">
                <Image src={item.icon} alt={item.name} fill className={isActive(item.value) ? "invert" : ""} />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ActiveUsers />
    </nav>
  );
};

export default memo(Navbar, (prevProps, nextProps) =>
  prevProps.activeElement === nextProps.activeElement
);