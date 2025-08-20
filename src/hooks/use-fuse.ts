import { useCallback, useEffect, useRef, useState } from "react";

export function useFuse<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const timeoutId = useRef<number>(undefined);

  const onComplete = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  const trigger = useCallback(
    (value: T, ms: number) => {
      setValue(value);

      window.clearTimeout(timeoutId.current);
      timeoutId.current = window.setTimeout(onComplete, ms);
    },
    [onComplete],
  );

  useEffect(() => {
    return () => window.clearTimeout(timeoutId.current);
  }, []);

  return [value, trigger] as const;
}
