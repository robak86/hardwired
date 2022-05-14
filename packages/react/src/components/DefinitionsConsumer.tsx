import { ReactElement } from 'react';
import { InstanceDefinition, InstancesArray } from 'hardwired';
import { useDefinitions } from '../hooks/useDefinitions';

export type DefinitionsConsumerProps<TInstanceDefinitions extends InstanceDefinition<any, any, never>[]> = {
  definitions: TInstanceDefinitions;
  render: (
    ...moduleAsObject: InstancesArray<TInstanceDefinitions>
  ) => ReactElement;
};

export function DefinitionsConsumer<TInstances extends InstanceDefinition<any, any, never>[]>({
  definitions,
  render,
}: DefinitionsConsumerProps<[...TInstances]>) {
  const moduleAsObject = useDefinitions(definitions as any);

  return render(...(moduleAsObject as any));
}
