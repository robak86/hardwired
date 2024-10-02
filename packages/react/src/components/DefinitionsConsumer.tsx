import { InstancesArray } from 'hardwired';
import { useAll } from '../hooks/useAll.js';
import { AnyDefinition } from 'hardwired';

export type DefinitionsConsumerProps<TInstanceDefinitions extends AnyDefinition[]> = {
  definitions: TInstanceDefinitions;
  render: (...moduleAsObject: InstancesArray<TInstanceDefinitions>) => React.ReactElement;
};

export function DefinitionsConsumer<TInstances extends AnyDefinition[]>({
  definitions,
  render,
}: DefinitionsConsumerProps<[...TInstances]>) {
  const moduleAsObject = useAll(...definitions);

  return render(...(moduleAsObject as any));
}
