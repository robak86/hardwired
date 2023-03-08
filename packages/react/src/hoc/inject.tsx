import { InstanceDefinition } from 'hardwired';

import * as React from 'react';
import { Optional } from 'utility-types';
import { useDefinitions } from '../hooks/useDefinitions.js';

export const inject =
  <TDefinitions extends Record<string, InstanceDefinition<any, any>>>(definitions: TDefinitions) =>
  <
    TProps extends {
      [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : never;
    },
  >(
    Component: React.FC<TProps>,
  ): React.FC<Optional<TProps, keyof TDefinitions>> => {
    const definitionKeys = Object.keys(definitions);

    return InjectWrapper;

    function InjectWrapper(props: Optional<TProps, keyof TDefinitions>) {
      const definitionKeysForInject = definitionKeys.filter(key => {
        return !props[key];
      });

      const definitionsForInject = definitionKeysForInject.map(key => definitions[key]);
      const instances = useDefinitions(definitionsForInject);

      const instancesObj: Record<string, any> = {};
      definitionKeysForInject.forEach((key, idx) => {
        instancesObj[key] = instances[idx];
      });

      return <Component {...instancesObj} {...(props as any)} />;
    }
  };
