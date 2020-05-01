// type ModuleRegistry<I, D, C> = {
//   imports: I;
//   declarations: D;
//   context: C;
// };

type Definition<T> = { definition: T };

type ModuleDefinitions = Record<string, Module<any> | Definition<any>>;

export class Module<R extends ModuleDefinitions> {
  public defs: R;
}

const module = <I extends Record<string, Module<any>>, D extends Record<string, Definition<any>>>() => {
  return new Module<{ [K in keyof (I & D)]: (I & D)[K] }>();
};

const a = module<{}, { z: Definition<number> }>();
const ap = module<{}, { z2: Definition<number> }>();

const b = module<{ imported: typeof a }, { z: Definition<number>; j: Definition<string> }>();
const c = module<{ imported: typeof b; imported2: typeof ap }, { z: Definition<number>; j: Definition<string> }>();

type DefinitionsUnion<T> = {
  [K in keyof T]: T[K] extends Definition<any> ? T[K] : never;
}[keyof T];

type DefinitionsKeys<T> = { [K in keyof T]: T[K] extends Definition<any> ? K : never }[keyof T];
type Definitions<T> = Pick<T, DefinitionsKeys<T>>;

type ImportsKeys<T> = { [K in keyof T]: T[K] extends Module<any> ? K : never }[keyof T];
type Imports<T> = Pick<T, ImportsKeys<T>>;

type FlattenModules<R extends ModuleDefinitions> =
  | (R extends ModuleDefinitions ? Module<R> : R)
  | {
      [K in keyof Imports<R>]: FlattenModules<Imports<R>[K]>;
    }[keyof Imports<R>];

type ZZ = Definitions<typeof b.defs>;
type ZZz = Imports<typeof b.defs>;

type Fla = FlattenModules<typeof b.defs>;

const wtf2: Fla = ap;
const wtf22: Fla = a;
