import { UnionToIntersection } from 'type-fest';
import { UnknownToNever } from './IsUnknown';
import { IsUnknown } from 'type-fest/source/set-return-type';
import { AnyInstanceDefinition } from "../definitions/abstract/AnyInstanceDefinition";

type ExternalsIntersection<TDepsInstances extends AnyInstanceDefinition<any, any>[]> = UnionToIntersection<
  {
    [K in keyof TDepsInstances]: TDepsInstances[K] extends AnyInstanceDefinition<any, infer TExternal>
      ? UnknownToNever<TExternal>
      : void;
  }[number]
>;

// prettier-ignore
export type PickExternals<TDepsInstances extends AnyInstanceDefinition<any, any>[]> =
    IsUnknown<ExternalsIntersection<TDepsInstances>> extends true ? void : ExternalsIntersection<TDepsInstances>

type ExternalsIntersectionRecord<TDepsInstances extends Record<keyof any, AnyInstanceDefinition<any, any>>> = UnionToIntersection<
    {
        [K in keyof TDepsInstances]: TDepsInstances[K] extends AnyInstanceDefinition<any, infer TExternal>
        ? UnknownToNever<TExternal>
        : void;
    }[keyof TDepsInstances]
    >;

// prettier-ignore
export type PickExternalsFromRecord<TDepsInstances extends Record<keyof any, AnyInstanceDefinition<any, any>>> =
    IsUnknown<ExternalsIntersectionRecord<TDepsInstances>> extends true ? void : ExternalsIntersectionRecord<TDepsInstances>
