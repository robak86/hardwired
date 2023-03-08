
import { InstanceDefinition, InstancesArray } from 'hardwired';
import { useDefinitions } from '../hooks/useDefinitions.js';

export type DefinitionsConsumerProps<TInstanceDefinitions extends InstanceDefinition<any, any>[]> = {
  definitions: TInstanceDefinitions;
  render: (...moduleAsObject: InstancesArray<TInstanceDefinitions>) => React.ReactElement;
};

export function DefinitionsConsumer<TInstances extends InstanceDefinition<any, any>[]>({
  definitions,
  render,
}: DefinitionsConsumerProps<[...TInstances]>) {
  const moduleAsObject = useDefinitions(definitions as any);

  return render(...(moduleAsObject as any));
}
