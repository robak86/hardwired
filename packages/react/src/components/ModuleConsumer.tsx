import { Module } from 'hardwired';
import { ReactElement } from 'react';
import { useModule } from '../hooks/useModule';

export type ModuleConsumerProps<TModule extends Module<any>> = {
  module: TModule;
  render: (moduleAsObject: Module.Materialized<TModule>) => ReactElement;
};

export function ModuleConsumer<TModule extends Module<any>>({ module, render }: ModuleConsumerProps<TModule>) {
  const moduleAsObject = useModule(module);

  return render(moduleAsObject);
}
