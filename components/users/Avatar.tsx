import React from "react";
import Image from "next/image";

import classes from './Avatar.module.css';

export function Avatar({ name, otherStyles }: { name: string; otherStyles: string; }) {
  return (
    <div data-tooltip={name} title={name} className={`${classes.avatar} ${otherStyles} w-9 h-9`}>
      <Image
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
        alt={name}
        fill
        className={classes.avatar_picture}
      />
    </div>
  );
}