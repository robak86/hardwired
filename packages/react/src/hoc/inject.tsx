import { InstanceDefinition } from 'hardwired';
import React, { FC } from 'react';
import { Optional } from 'utility-types';
import { useDefinitions } from '../hooks/useDefinitions';

export const inject =
  <TDefinitions extends Record<string, InstanceDefinition<any>>>(definitions: TDefinitions) =>
  <
    TProps extends {
      [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance> ? TInstance : never;
    },
  >(
    Component: FC<TProps>,
  ): FC<Optional<TProps, keyof TDefinitions>> => {
    const definitionsKeys = Object.keys(definitions);

    return props => {
      const definitionKeysForInject = definitionsKeys.filter(key => {
        return !props[key];
      });

      const definitionsForInject = definitionKeysForInject.map(key => definitions[key]);
      const instances = useDefinitions(...(definitionsForInject as [any, ...any[]]));

      const instancesObj = {};
      definitionKeysForInject.forEach((key, idx) => {
        instancesObj[key] = instances[idx];
      });

      return <Component {...instancesObj} {...(props as any)} />;
    };
  };
