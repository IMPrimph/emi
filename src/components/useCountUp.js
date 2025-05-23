import { useEffect, useRef, useState } from 'react';

export default function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef();
  useEffect(() => {
    let start = 0;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(start + (target - start) * progress));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}
