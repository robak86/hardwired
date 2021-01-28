import { Module } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useRef } from 'react';

export type UseModuleHook = <TModule extends Module<any>>(module: TModule) => Module.Materialized<TModule>;

export const useModule: UseModuleHook = module => {
  const container = useContainer();
  const instanceRef = useRef(container.getContext().forNewRequest());

  return instanceRef.current.materializeModule(module, instanceRef.current);
};
