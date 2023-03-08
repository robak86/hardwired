import * as React from "react";


export function useForceRender() {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
  return forceUpdate;
}
