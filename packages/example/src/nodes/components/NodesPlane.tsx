import React from 'react';
import styled from 'styled-components';

const Container = styled('div')({
  width: 1000,
  height: 1000,
  backgroundColor: 'grey',
});

export const NodesPlane = () => {
  throw new Error('Implement me');
  // const nodesIds = useSelector(nodesModule, 'selectNodesIds');

  // return (
  //   <Container>
  //     {nodesIds.map(nodeId => {
  //       return <DNode id={nodeId} key={nodeId} />;
  //     })}
  //   </Container>
  // );
};
