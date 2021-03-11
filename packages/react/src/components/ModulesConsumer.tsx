import { Module } from 'hardwired';
import { ReactElement } from 'react';
import { useModules } from '../hooks/useModules';

export type ModulesConsumerProps<TModule extends Module<any>[]> = {
  modules: TModule;
  render: (moduleAsObject: Module.MaterializedArray<TModule>) => ReactElement;
};

export function ModulesConsumer<TModule extends Module<any>, TModules extends [TModule, ...TModule[]]>({
  modules,
  render,
}: ModulesConsumerProps<TModules>) {
  const moduleAsObject = useModules(...modules);

  return render(moduleAsObject as any);
}
