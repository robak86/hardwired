export type NodesState = {
  nodesIds: string[];
  nodesPositions: { [nodeId: string]: DiagramNode };
};

export type DiagramNode = {
  x: number;
  y: number;
};

export const NodesState = {
  build(): NodesState {
    const nodesState: NodesState = { nodesIds: [], nodesPositions: {} };

    for (let i = 0; i < 2; i++) {
      nodesState.nodesIds.push(i.toString());
      nodesState.nodesPositions[i.toString()] = {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
      };
    }

    return nodesState;
  },
};
