'use client';
import { useCallback, useRef } from "react";
import { ThreadData } from "@liveblocks/client";

import { useMaxZIndex } from "@/lib/useMaxZIndex";
import { ThreadMetadata, useEditThreadMetadata, useThreads, useUser } from "@/liveblocks.config";
import { PinnedThread } from "./PinnedThread";

type OverlayThreadProps = {
  thread: ThreadData<ThreadMetadata>;
  maxZIndex: number;
};

export const CommentsOverlay = () => {
  const { threads } = useThreads();
  const maxZIndex = useMaxZIndex();

  return (
    <div>
      {threads.filter(thread => !thread.metadata.resolved).map(thread => (
        <OverlayThread key={thread.id} thread={thread} maxZIndex={maxZIndex} />
      ))}
    </div>
  );
};

const OverlayThread = ({ thread, maxZIndex }: OverlayThreadProps) => {
  const editThreadMetadata = useEditThreadMetadata();

  const { isLoading } = useUser(thread.comments[0].userId);   //  We're using the useUser hook to get the user of the thread.

  const threadRef = useRef<HTMLDivElement>(null);   // We're using a ref to get the thread element to position it

  // If other thread(s) above, increase z-index on last element updated
  const handleIncreaseZIndex = useCallback(() => {
    //@ts-ignore
    if (maxZIndex === thread.metadata.zIndex) return;

    editThreadMetadata({
      threadId: thread.id,
      metadata: { zIndex: maxZIndex + 1 }    // Update the z-index of the thread in the room
    });

  }, [thread, editThreadMetadata, maxZIndex]);

  if (isLoading) return null;

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      style={{ transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)` }}
      className="absolute left-0 top-0 flex gap-5"
    >
      {/* render the thread */}
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
};