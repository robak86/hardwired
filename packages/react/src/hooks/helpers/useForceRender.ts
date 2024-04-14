import { useReducer } from 'react';

export function useForceRender() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  return forceUpdate;
}
