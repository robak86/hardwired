import * as React from 'react';
import { FunctionComponent, useEffect, useRef } from 'react';
import { ContainerContext, useContainer } from './ContainerContext';

export const ContainerScope: FunctionComponent = ({ children }) => {
  const container = useContainer();
  const childContainer = useRef(container.checkout());

  useEffect(()=> {

    // TODO: dispose scope on unmount!
    return () => {};
  }, []);

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: childContainer.current }} children={children} />;
};
