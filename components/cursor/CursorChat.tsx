import React from 'react';

import { CursorChatProps, CursorMode } from "@/types/type";
import CursorSVG from "@/public/assets/CursorSVG";

const CursorChat = ({ cursor, cursorState, setCursorState, updateMyPresence }: CursorChatProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: e.target.value });
    
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: e.target.value
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') {
      setCursorState({
        mode: CursorMode.Chat,
        // @ts-ignore
        previousMessage: cursorState.message,
        message: ''
      });
    } else if (e.key === 'Escape') {
      setCursorState({ mode: CursorMode.Hidden });
    }
  };

  return (
    <div style={{ transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)` }} className="absolute top-0 left-0">
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color="#000" />

          <div className="absolute left-2 top-2 text-sm leading-relaxed text-white bg-blue-500 rounded-[20px] px-4 py-2">
            {cursorState.previousMessage && (
              <div>{cursorState.previousMessage}</div>
            )}
            <input
              className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
              autoFocus={true}
              placeholder={cursorState.previousMessage ? '' : 'Type a message'}
              value={cursorState.message}
              maxLength={50}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CursorChat;