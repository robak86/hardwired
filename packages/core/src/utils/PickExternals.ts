import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { UnionToIntersection } from 'type-fest';
import { UnknownToNever } from './IsUnknown';
import { IsUnknown } from 'type-fest/source/set-return-type';

type ExternalsIntersection<TDepsInstances extends InstanceDefinition<any, any>[]> = UnionToIntersection<
  {
    [K in keyof TDepsInstances]: TDepsInstances[K] extends InstanceDefinition<any, infer TExternal>
      ? UnknownToNever<TExternal>
      : void;
  }[number]
>;

// prettier-ignore
export type PickExternals<TDepsInstances extends InstanceDefinition<any, any>[]> =
    IsUnknown<ExternalsIntersection<TDepsInstances>> extends true ? void : ExternalsIntersection<TDepsInstances>

type ExternalsIntersectionRecord<TDepsInstances extends Record<keyof any, InstanceDefinition<any, any>>> = UnionToIntersection<
    {
        [K in keyof TDepsInstances]: TDepsInstances[K] extends InstanceDefinition<any, infer TExternal>
        ? UnknownToNever<TExternal>
        : void;
    }[keyof TDepsInstances]
    >;

// prettier-ignore
export type PickExternalsFromRecord<TDepsInstances extends Record<keyof any, InstanceDefinition<any, any>>> =
    IsUnknown<ExternalsIntersectionRecord<TDepsInstances>> extends true ? void : ExternalsIntersectionRecord<TDepsInstances>
