import React from 'react';
import styled from 'styled-components';
import { useWatchable } from '@hardwired/react';
import { nodesModule } from '../nodes.module';
import { DNode } from './DNode';

const Container = styled('div')({
  width: 1000,
  height: 1000,
  backgroundColor: 'grey',
});

export const NodesPlane = () => {
  const nodesIds = useWatchable(nodesModule, 'selectNodesIds');

  return (
    <Container>
      {nodesIds.map(nodeId => {
        return <DNode id={nodeId} key={nodeId} />;
      })}
    </Container>
  );
};
