import { ExternalsDefinitions, WithExternals } from '../definitions/abstract/base/BaseDefinition';

// prettier-ignore
export type PickExternals<T> =
    T extends [] ? never :
    T extends [WithExternals<never>] ? never :
    T extends [WithExternals<infer TExternals>] ? TExternals :
    T extends [WithExternals<never>, ...infer Rest] ? PickExternals<Rest> :
    T extends [WithExternals<infer TExternals>, ...infer Rest] ? TExternals & NeverToUnknown<PickExternals<Rest>>:
    never

export type IsNever<T> = [T] extends [never] ? true : false;
export type NeverToVoid<T> = IsNever<T> extends true ? void : T;
type NeverToUnknown<T> = IsNever<T> extends true ? unknown : T;

export type ExternalsValues<TExternals> = IsNever<TExternals> extends true ? [] : [TExternals];

export const pickExternals = <T extends WithExternals<any>[]>(externals: T): ExternalsDefinitions<PickExternals<T>> => {
  const merged = {} as ExternalsDefinitions<PickExternals<T>>;

  externals.forEach(externalsObj => {
    Object.keys(externalsObj).forEach(key => {
      const current = externalsObj[key as keyof typeof externalsObj] as any;

      if (merged[key as keyof typeof merged]) {
        if (merged[key as keyof typeof merged] !== current) {
          throw new Error(`Multiple externals with id=${current.id} detected.`);
        }
      }

      merged[key as keyof typeof merged] = current;
    });
  });

  return merged;
};

export const externalsToScopeOverrides = () => {

}
