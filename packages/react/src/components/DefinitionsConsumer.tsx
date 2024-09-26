import { BaseDefinition, InstancesArray } from 'hardwired';
import { useAll } from '../hooks/useAll.js';

export type DefinitionsConsumerProps<TInstanceDefinitions extends BaseDefinition<any, any, any>[]> = {
  definitions: TInstanceDefinitions;
  render: (...moduleAsObject: InstancesArray<TInstanceDefinitions>) => React.ReactElement;
};

export function DefinitionsConsumer<TInstances extends BaseDefinition<any, any, any>[]>({
  definitions,
  render,
}: DefinitionsConsumerProps<[...TInstances]>) {
  const moduleAsObject = useAll(...definitions);

  return render(...(moduleAsObject as any));
}
