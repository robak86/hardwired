import * as React from 'react';
import { FunctionComponent, useRef } from 'react';
import { ContainerContext, useContainer } from '../context/ContainerContext';

export const ContainerScope: FunctionComponent = ({ children }) => {
  const container = useContainer();
  const childContainer = useRef(container.checkout());

  // useEffect(()=> {
  // TODO: dispose scope on unmount ??. Probably not possible, because we cannot be sure that all async calls within scope
  //       were finished
  // return () => {};
  // }, []);

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: childContainer.current }} children={children} />;
};
