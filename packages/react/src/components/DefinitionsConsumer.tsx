import { BaseDefinition, InstancesArray } from 'hardwired';
import { useDefinitions } from '../hooks/useDefinitions.js';

export type DefinitionsConsumerProps<TInstanceDefinitions extends BaseDefinition<any, any, any, any>[]> = {
  definitions: TInstanceDefinitions;
  render: (...moduleAsObject: InstancesArray<TInstanceDefinitions>) => React.ReactElement;
};

export function DefinitionsConsumer<TInstances extends BaseDefinition<any, any, any, any>[]>({
  definitions,
  render,
}: DefinitionsConsumerProps<[...TInstances]>) {
  const moduleAsObject = useDefinitions(...definitions);

  return render(...(moduleAsObject as any));
}
