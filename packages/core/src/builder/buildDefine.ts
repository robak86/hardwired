import {
  InstanceDefinition,
  InstancesArray,
  InstancesRecord,
} from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { value } from '../definitions/sync/value.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { singleton } from '../definitions/definitions.js';
import { v4 } from 'uuid';
import { Resolution } from '../definitions/abstract/Resolution.js';

// TODO:
// we probably don't need Resolution enum
// we probably don't need AsyncDefinition
// - strategies are synchronous. and with the new approach we can just use async functions

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue, TExternals>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue, TExternals>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue, TExternals>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue;

  getAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions>;
}

// type InstanceDefineFn<TBindings extends Record<string, InstanceDefinition<any, any, any>>> = <TInstance>(
//   callback: (this: InstancesRecord<TBindings>) => TInstance,
// ) => InstanceDefinition<TInstance, LifeTime.singleton, unknown>;

// type InstanceBuilders<TBindings extends Record<string, InstanceDefinition<any, any, any>>> = {
//   singleton: InstanceDefineFn<TBindings>;
//   scoped: InstanceDefineFn<TBindings>;
//   transient: InstanceDefineFn<TBindings>;
// };
//
// export const bind = <TBindings extends Record<string, InstanceDefinition<any, any, any>>>(params: TBindings) => {
//   const singleton: InstanceDefineFn<TBindings> = () => {
//     throw new Error('Implement me!');
//   };
//
//   const transient: InstanceDefineFn<TBindings> = () => {
//     throw new Error('Implement me!');
//   };
//
//   const scoped: InstanceDefineFn<TBindings> = () => {
//     throw new Error('Implement me!');
//   };
//
//   return {
//     singleton,
//   };
// };

const valA = value('a');
const valB = value(2);

// const instances = bind({
//   valA,
//   valB,
// }).singleton(function () {
//   return this.valB;
// });

type CustomBind<
  TBuildIns extends Record<string, InstanceDefinition<any, any, any>>,
  TPreambleArgs extends any[],
  TMeta,
  TLifeTime,
> = {
  // meta?: TMeta;
  lifeTime?: TLifeTime;
  include?: TBuildIns;
  after?: <TInstance>(instance: TInstance, meta: TMeta) => TInstance;
  pre?: <TInstance>(def: AnyInstanceDefinition<TInstance, any, any>) => TInstance;
  preArgs?: (...args: TPreambleArgs) => TMeta;
};

export const buildDefine = <
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
  TPreambleArgs extends any[],
  TMeta,
  TLifeTime extends LifeTime = LifeTime.singleton,
>(
  params: CustomBind<TProvidedBindings, TPreambleArgs, TMeta, TLifeTime>,
) => {
  return <TInstance>(
    // defineFn: (cnt: InstanceCreationAware & InstancesRecord<TProvidedBindings>) => TInstance,
    ...args: [...TPreambleArgs, (cnt: InstanceCreationAware & InstancesRecord<TProvidedBindings>) => TInstance]
  ): InstanceDefinition<TInstance, TLifeTime, TMeta> => {
    const definition = new InstanceDefinition<TInstance, TLifeTime, TMeta>(
      v4(),
      Resolution.sync,
      params.lifeTime ?? (LifeTime.singleton as any),
      context => {
        const included = {} as any;

        Object.entries(params.include ?? {}).forEach(([key, def]) => {
          included[key] = context.buildWithStrategy(def);
        });

        const contextWithExt = {
          ...context,
          ...included,
        };

        const defineFn = args.at(-1) as (cnt: InstanceCreationAware & InstancesRecord<TProvidedBindings>) => TInstance;

        const preambleArgs = args.slice(0, -1) as TPreambleArgs;

        const instance = defineFn(contextWithExt);

        return params.after ? params.after(instance, params.preArgs?.(...preambleArgs) as TMeta) : instance;
      },
      [], // not usable for this kind of definitions
    );

    return definition;
  };
};

const def = buildDefine({
  // meta: {
  //   label: 'myLabel' as const,
  // },
  lifeTime: LifeTime.transient,
  include: {
    valA,
    valB,
  },
  pre: <TInstance>(def: AnyInstanceDefinition<TInstance, any, any>): TInstance => {
    throw new Error('Implement me!');
  },
  after: <T>(instance: T) => {
    // TODO: makeAutoObservable(instance);
    return instance;
  },
});

const someSyncDef = singleton.async().fn(async () => {
  return 123;
});

const withMoreParams = (label: string) => {};

// NO need for special builder for async definitions. Pass an async function
// no need for thunks - as we always reference instance definitions inside the define function
const myDef = def(async ({ use }) => {
  const a = use(valA);
  const a1 = use(valA);
  const b = await use(someSyncDef);

  // const b = self.get(valB);
  // const b = self.get(valB);
  // const b = self.get(valB);

  return {
    // a: () => b
    doSomething: 123,
  };
});

const otherDef = def(async ({ use }) => {
  const dep = await use(myDef);
});

const action = buildDefine({
  lifeTime: LifeTime.transient,
  include: {
    valA,
    valB,
  },
  preArgs(label: string) {
    return {
      kind: 'action' as const,
      label,
    };
  },
  pre: <TInstance>(def: AnyInstanceDefinition<TInstance, any, any>): TInstance => {
    throw new Error('Implement me!');
  },
  after: <T>(instance: T) => {
    // TODO: makeAutoObservable(instance);
    return instance;
  },
});

const myAction = action('myLabel', async ({ use }) => {
  return null;
});
