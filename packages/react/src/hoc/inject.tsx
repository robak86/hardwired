import { Optional } from 'utility-types';
import { useAll } from '../hooks/useAll.js';
import { FC } from 'react';
import { AnyDefinition, Definition } from 'hardwired';

export const inject =
  <TDefinitions extends Record<string, AnyDefinition>>(definitions: TDefinitions) =>
  <
    TProps extends {
      [K in keyof TDefinitions]: TDefinitions[K] extends Definition<infer TInstance, any, any> ? TInstance : never;
    },
  >(
    Component: FC<TProps>,
  ): FC<Optional<TProps, keyof TDefinitions>> => {
    const definitionKeys = Object.keys(definitions);

    return InjectWrapper;

    function InjectWrapper(props: Optional<TProps, keyof TDefinitions>) {
      const definitionKeysForInject = definitionKeys.filter(key => {
        return !props[key];
      });

      const definitionsForInject = definitionKeysForInject.map(key => definitions[key]);
      const instances = useAll(...definitionsForInject);

      const instancesObj: Record<string, any> = {};
      definitionKeysForInject.forEach((key, idx) => {
        instancesObj[key] = instances[idx];
      });

      return <Component {...instancesObj} {...(props as any)} />;
    }
  };
