'use client';
import React, { useCallback, useEffect, useState } from 'react';

import { useBroadcastEvent, useEventListener, useMyPresence } from "@/liveblocks.config";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import LiveCursors from "./cursor/LiveCursors";
import CursorChat from "./cursor/CursorChat";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import { Comments } from "./comments/Comments";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./ui/context-menu";
import { shortcuts } from "@/constants";

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {

  const [{ cursor }, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();

  const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const setReaction = useCallback((reaction: string) => {      // set the reaction of the cursor
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReactions(reactions => reactions.filter(r => r.timestamp > Date.now() - 4000));
  }, 1000);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReactions(reactions => reactions.concat([    // concat all the reactions created on mouse click
        {
          point: { x: cursor.x, y: cursor.y },
          value: cursorState.reaction,
          timestamp: Date.now(),
        }
      ]));

      broadcast({   // broadcast the reaction to other users
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction
      });
    }
  }, 100);

  useEventListener(eventData => {   // listen to events broadcasted by other users
    const event = eventData.event
    setReactions(reactions => reactions.concat([
      {
        point: { x: event.x, y: event.y },
        value: event.value,
        timestamp: Date.now(),
      }
    ]));
  });

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      // Subtracting position of the cursor relative to the window. Not subtracting from cursor width
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });
    }
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    setCursorState({ mode: CursorMode.Hidden });

    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({ cursor: { x, y } });

    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
    );
  }, [cursorState.mode, setCursorState]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
    );
  }, [cursorState.mode, setCursorState]);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === '/') {
        setCursorState({
          mode: CursorMode.Chat,
          // @ts-ignore
          previousMessage: null,
          message: '',
        });
      } else if (e.key === 'Escape') {
        updateMyPresence({ message: '' });

        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === 'e') {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') e.preventDefault();
    };

    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [updateMyPresence]);

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case 'Chat':
        setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: '' });
        break;
      case 'Undo':
        undo();
        break;
      case 'Redo':
        redo();
        break;
      case 'Reactions':
        setCursorState({ mode: CursorMode.ReactionSelector });
        break;
      
      default:
        break;
    }
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger id="canvas"
        className="relative flex flex-1 justify-center items-center w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} />

        {reactions.map(reaction => (
          <FlyingReaction
            key={reaction.timestamp.toString()}
            x={reaction.point.x}
            y={reaction.point.y}
            timestamp={reaction.timestamp}
            value={reaction.value}
          />
        ))}
        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}
        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={(reaction) => { setReaction(reaction); }} />
        )}

        <LiveCursors />
        <Comments />
      </ContextMenuTrigger>

      <ContextMenuContent className="right-menu-content">
        {shortcuts.map(item => (
          <ContextMenuItem key={item.key}
            onClick={() => handleContextMenuClick(item.name)}
            className="right-menu-item"
          >
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;