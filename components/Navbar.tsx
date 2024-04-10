'use client';
import React, { memo } from 'react';
import Image from "next/image";

import { ActiveElement, NavbarProps } from "@/types/type";
import ActiveUsers from "./users/ActiveUsers";
import { navElements } from "@/constants";
import ShapesMenu from "./ShapesMenu";
import NewThread from "./comments/NewThread";

const Navbar = ({ activeElement }: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) && value.some(val => val?.value === activeElement?.value));

  return (
    <nav className="flex justify-between items-center gap-4 select-none text-white bg-primary-black px-5">
      <Image src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />
      <ul className="flex flex-row">
        {navElements.map((item: ActiveElement | any) => (
          <li key={item.name}>
            {Array.isArray(item.value)
              ? (<ShapesMenu />)
              : item?.value === 'çomments'
                ? (
                  <NewThread>

                  </NewThread>
                )
                : (
                  <button>

                  </button>
                )
            }
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