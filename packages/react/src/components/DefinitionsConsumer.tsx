import { Definition, InstancesArray } from 'hardwired';
import { useAll } from '../hooks/useAll.js';

export type DefinitionsConsumerProps<TInstanceDefinitions extends Definition<any, any, any>[]> = {
  definitions: TInstanceDefinitions;
  render: (...moduleAsObject: InstancesArray<TInstanceDefinitions>) => React.ReactElement;
};

export function DefinitionsConsumer<TInstances extends Definition<any, any, any>[]>({
  definitions,
  render,
}: DefinitionsConsumerProps<[...TInstances]>) {
  const moduleAsObject = useAll(...definitions);

  return render(...(moduleAsObject as any));
}
