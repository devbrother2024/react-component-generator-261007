import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

export function usePersistentState<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T | undefined,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, parse));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
