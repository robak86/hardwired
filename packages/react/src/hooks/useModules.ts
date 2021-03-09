import { Module } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useRef } from 'react';

export type UseModulesHook = <TModules extends [...Module<any>[]]>(
  ...modules: TModules
) => Module.MaterializedArray<TModules>;

export const useModules: UseModulesHook = (...modules) => {
  const container = useContainer();
  const instanceRef = useRef(container.asObjectMany(...modules as any));

  return instanceRef.current as any;
};
