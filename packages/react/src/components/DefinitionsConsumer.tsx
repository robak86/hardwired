import { ReactElement } from 'react';
import { InstanceDefinition } from 'hardwired';
import { useDefinitions } from '../hooks/useDefinitions';

export type DefinitionsConsumerProps<TInstanceDefinitions extends InstanceDefinition<any, any>[]> = {
  definitions: TInstanceDefinitions;
  render: (
    ...moduleAsObject: {
      [K in keyof TInstanceDefinitions]: TInstanceDefinitions[K] extends InstanceDefinition<infer TIntance, any>
        ? TIntance
        : unknown;
    }
  ) => ReactElement;
};

export function DefinitionsConsumer<
  TInstance extends InstanceDefinition<any, any>,
  TInstances extends [TInstance, ...TInstance[]],
>({ definitions, render }: DefinitionsConsumerProps<TInstances>) {
  const moduleAsObject = useDefinitions(definitions);

  return render(...(moduleAsObject as any));
}
