"use client";
import React, { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ComposerSubmitComment } from "@liveblocks/react-comments/primitives";
import * as Portal from "@radix-ui/react-portal";
import { Slot } from "@radix-ui/react-slot";

import { useMaxZIndex } from "@/lib/useMaxZIndex";
import { useCreateThread } from "@/liveblocks.config";
import PinnedComposer from "./PinnedComposer";
import NewThreadCursor from "./NewThreadCursor";

type ComposerCoords = null | { x: number; y: number; };

type Props = {
  children: ReactNode;
};

export const NewThread = ({ children }: Props) => {
  // set state to track if we're placing a new comment or not
  const [creatingCommentState, setCreatingCommentState] = useState<"placing" | "placed" | "complete">("complete");

  const createThread = useCreateThread();
  const maxZIndex = useMaxZIndex();

  // set state to track the coordinates of the composer (liveblocks comment editor)
  const [composerCoords, setComposerCoords] = useState<ComposerCoords>(null);

  // set state to track the last pointer event
  const lastPointerEvent = useRef<PointerEvent>();

  // set state to track if user is allowed to use the composer
  const [allowUseComposer, setAllowUseComposer] = useState(false);
  const allowComposerRef = useRef(allowUseComposer);
  allowComposerRef.current = allowUseComposer;

  useEffect(() => {
    if (creatingCommentState === "complete") return;  // If composer is already placed, don't do anything

    // Place a composer on the screen
    const newComment = (e: MouseEvent) => {
      e.preventDefault();

      if (creatingCommentState === "placed") {   // If already placed, click outside to close composer

        const isClickOnComposer = ((e as any)._savedComposedPath = e     // check if the click event is on/inside the composer
          .composedPath()
          .some((el: any) => {
            return el.classList?.contains("lb-composer-editor-actions");
          }));

        if (isClickOnComposer) return;   // if click is inisde/on composer, don't do anything

        if (!isClickOnComposer) {    // if click is outside composer, close composer
          setCreatingCommentState("complete");
          return;
        }
      }

      setCreatingCommentState("placed");   // First click sets composer down
      setComposerCoords({ x: e.clientX, y: e.clientY });
    };

    document.documentElement.addEventListener("click", newComment);

    return () => {
      document.documentElement.removeEventListener("click", newComment);
    };
  }, [creatingCommentState]);

  useEffect(() => {
    // If dragging composer, update position
    const handlePointerMove = (e: PointerEvent) => {
      (e as any)._savedComposedPath = e.composedPath();   // Prevents issue with composedPath getting removed
      lastPointerEvent.current = e;
    };

    document.documentElement.addEventListener("pointermove", handlePointerMove);

    return () => {
      document.documentElement.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  // Set pointer event from last click on body for use later
  useEffect(() => {
    if (creatingCommentState !== "placing") return;

    const handlePointerDown = (e: PointerEvent) => {
      if (allowComposerRef.current) return;   // if composer is already placed, don't do anything

      (e as any)._savedComposedPath = e.composedPath();   // Prevents issue with composedPath getting removed
      lastPointerEvent.current = e;
      setAllowUseComposer(true);
    };

    // Right click to cancel placing
    const handleContextMenu = (e: Event) => {
      if (creatingCommentState === "placing") {
        e.preventDefault();
        setCreatingCommentState("complete");
      }
    };

    document.documentElement.addEventListener("pointerdown", handlePointerDown);
    document.documentElement.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.documentElement.removeEventListener("pointerdown", handlePointerDown);
      document.documentElement.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [creatingCommentState]);

  // On composer submit, create thread and reset state
  const handleComposerSubmit = useCallback(
    ({ body }: ComposerSubmitComment, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const overlayPanel = document.querySelector("#canvas");  // Get your canvas element

      // if there's no composer coords or last pointer event, meaning the user hasn't clicked yet, don't do anything
      if (!composerCoords || !lastPointerEvent.current || !overlayPanel) return;

      const { top, left } = overlayPanel.getBoundingClientRect();  // Set coords relative to the top left of your canvas
      const x = composerCoords.x - left;
      const y = composerCoords.y - top;

      // create a new thread with the composer coords and cursor selectors
      createThread({
        body,
        metadata: { x, y, resolved: false, zIndex: maxZIndex + 1 }
      });

      setComposerCoords(null);
      setCreatingCommentState("complete");
      setAllowUseComposer(false);
    },
    [createThread, composerCoords, maxZIndex]
  );

  return (
    <>
      <Slot style={{ opacity: creatingCommentState !== "complete" ? 0.7 : 1 }}
        onClick={() => setCreatingCommentState(creatingCommentState !== "complete" ? "complete" : "placing")}
      >
        {children}
      </Slot>

      {/* if composer coords exist and we're placing a comment, render the composer */}
      {composerCoords && creatingCommentState === "placed" ? (
        // Portal.Root is used to render the composer outside of the NewThread component to avoid z-index issuess
        <Portal.Root
          className='absolute left-0 top-0'
          style={{ pointerEvents: allowUseComposer ? "initial" : "none", transform: `translate(${composerCoords.x}px, ${composerCoords.y}px)` }}
          data-hide-cursors
        >
          <PinnedComposer onComposerSubmit={handleComposerSubmit} />
        </Portal.Root>
      ) : null}

      {/* Show the customizing cursor when placing a comment. The one with comment shape */}
      <NewThreadCursor display={creatingCommentState === "placing"} />
    </>
  );
};