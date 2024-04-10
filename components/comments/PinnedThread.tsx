'use client';
import { useMemo, useState } from "react";
import Image from 'next/image';
import { ThreadData } from "@liveblocks/client";

import { ThreadMetadata } from "@/liveblocks.config";

type Props = {
  thread: ThreadData<ThreadMetadata>;
  onFocus: (threadId: string) => void;
};

export const PinnedThread = ({ thread, onFocus, ...props }: Props) => {
  // Open pinned threads that have just been created
  const startMinimized = useMemo(
    () => Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread]
  );

  const [minimized, setMinimized] = useState(startMinimized);

  /**
   * Memoize the result of this function so that it doesn't change on every render but only when the thread changes
   * Memo is used to optimize performance and avoid unnecessary re-renders.
   */
  const memoizedContent = useMemo(() => (
    <div className="flex gap-4 absolute cursor-pointer"
      {...props}
      onClick={(e: any) => {
        onFocus(thread.id);
        if (e.target &&
          e.target.classList.contains("lb-icon") &&
          e.target.classList.contains("lb-button-icon")
        ) return;
        setMinimized(!minimized);
      }}
    >
      <div data-draggable={true} className='relative flex h-9 w-9 select-none items-center justify-center rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow'>
        <Image src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
          alt='image'
          width={28}
          height={28}
          draggable={false}
          className="rounded-full"
        />
      </div>
      {!minimized ? (
        <div className="flex flex-col min-w-60 overflow-hidden rounded-lg bg-white text-sm shadow"></div>
      ) : null}
    </div>
  ), [thread.comments.length, minimized]);

  return <>{memoizedContent}</>;
};