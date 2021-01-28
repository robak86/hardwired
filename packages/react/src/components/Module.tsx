import { Module } from 'hardwired';
import { ReactElement } from 'react';
import { useModule } from '../hooks/useModule';

export type ModuleObjectProps<TModule extends Module<any>> = {
  module: TModule;
  render: (moduleAsObject: Module.Materialized<TModule>) => ReactElement;
};

export function ModuleObject<TModule extends Module<any>>({ module, render }: ModuleObjectProps<TModule>) {
  const moduleAsObject = useModule(module);

  return render(moduleAsObject);
}
