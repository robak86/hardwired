import React, { FunctionComponent, useCallback } from 'react';
import styled from 'styled-components';
import { useDependency, useWatchable } from 'hardwired-react';
import { nodesModule } from '../nodes.module';
import Draggable from 'react-draggable';
import { useSelector } from 'hardwired-redux';

export type DNodeProps = {
  id: string;
};

const NodeContainer = styled('div')({
  width: 50,
  height: 50,
  backgroundColor: 'red',
});

export const DNode: FunctionComponent<DNodeProps> = ({ id }) => {
  const getPosition = useSelector(nodesModule, 'selectNodePosition', id);
  const setPosition = useDependency(nodesModule, 'setNodePosition');

  const { x, y } = getPosition;

  // console.log('current position', id, x, y);

  const onDragStart = useCallback((...args) => {
    // console.log('onDragStart', ...args);
  }, []);

  const onDragStop = useCallback((event, obj) => {
    // console.log('onDragStop', obj.x, obj.y, obj);

    setPosition({ id, x: obj.x, y: obj.y, deltaX: obj.deltaX, deltaY: obj.deltaY });
  }, []);

  const onDrag = useCallback((...args) => {
    // console.log('onDrag', ...args);
  }, []);

  // console.log(x, y);
  return (
    <Draggable
      // axis="x"
      // handle=".handle"
      // defaultPosition={{ x, y }}
      position={{ x, y }}
      // grid={[25, 25]}
      // scale={1}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragStop}
    >
      <NodeContainer>{id}</NodeContainer>
    </Draggable>
  );
};
