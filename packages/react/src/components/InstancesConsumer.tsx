import { ReactElement } from 'react';
import { InstanceDefinition } from 'hardwired';
import { useDefinitions } from '../hooks/useDefinitions';

export type ModulesConsumerProps<TInstanceDefinitions extends InstanceDefinition<any>[]> = {
  definitions: TInstanceDefinitions;
  render: (
    ...moduleAsObject: {
      [K in keyof TInstanceDefinitions]: TInstanceDefinitions[K] extends InstanceDefinition<infer TIntance>
        ? TIntance
        : unknown;
    }
  ) => ReactElement;
};

export function InstancesConsumer<
  TInstance extends InstanceDefinition<any>,
  TInstances extends [TInstance, ...TInstance[]],
>({ definitions, render }: ModulesConsumerProps<TInstances>) {
  const moduleAsObject = useDefinitions(definitions);

  return render(...(moduleAsObject as any));
}
