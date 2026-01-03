import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 500 }: UseLongPressOptions) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<number | undefined>(undefined);
  const target = useRef<EventTarget | undefined>(undefined);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      event.preventDefault();
      target.current = event.target;
      timeout.current = window.setTimeout(() => {
        onLongPress();
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (_event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (shouldTriggerClick && !longPressTriggered && onClick) {
        onClick();
      }
      setLongPressTriggered(false);
    },
    [onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  };
}
