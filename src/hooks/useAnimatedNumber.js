import { useEffect, useRef, useState } from 'react';

export function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    const start = displayRef.current;
    const diff = target - start;
    if (Math.abs(diff) < 0.005) {
      setDisplay(target);
      displayRef.current = target;
      return;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = start + diff * eased;
      setDisplay(value);
      displayRef.current = value;
      if (progress < 1) requestAnimationFrame(tick);
      else {
        setDisplay(target);
        displayRef.current = target;
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}
