import React from 'react';
import styled from 'styled-components';
import { nodesModule } from '../nodes.module';
import { DNode } from './DNode';

import { useSelector } from 'react-redux';
import { useDefinition } from 'hardwired-react';

const NodesPlaneBox = styled('div')({
  width: 1000,
  height: 1000,
  backgroundColor: 'grey',
});

export const NodesPlane = () => {
  const selectNodesIds = useDefinition(nodesModule.selectNodesIds);
  const nodesIds = useSelector(selectNodesIds);

  return (
    <NodesPlaneBox>
      {nodesIds.map(nodeId => {
        return <DNode id={nodeId} key={nodeId} />;
      })}
    </NodesPlaneBox>
  );
};
