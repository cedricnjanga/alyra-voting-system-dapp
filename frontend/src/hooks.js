import { useEffect, useRef } from "react";

export const usePrevious = value => {
  const ref = useRef(value);

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)

  return ref.current;
}