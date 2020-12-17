import { ModuleBuilder } from '@hardwired/core';
import { useContainer } from '../components/ContainerContext';
import { Module } from '@hardwired/core';
import { useRef } from 'react';

export const useDependency = <
  TModuleBuilder extends ModuleBuilder<any>,
  K extends Module.InstancesKeys<TModuleBuilder> & string
>(
  module: TModuleBuilder,
  key: K,
) => {
  const instanceRef = useRef<any>();

  if (!instanceRef.current) {
    const container = useContainer();
    instanceRef.current = container.get(module, key);
  }

  return instanceRef.current;
};
