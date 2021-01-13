import React from 'react';
import styled from 'styled-components';
import { nodesModule } from '../nodes.module';
import { DNode } from './DNode';
import { useSelector } from 'hardwired-redux';

const Container = styled('div')({
  width: 1000,
  height: 1000,
  backgroundColor: 'grey',
});

export const NodesPlane = () => {
  const nodesIds = useSelector(nodesModule, 'selectNodesIds');

  return (
    <Container>
      {nodesIds.map(nodeId => {
        return <DNode id={nodeId} key={nodeId} />;
      })}
    </Container>
  );
};
