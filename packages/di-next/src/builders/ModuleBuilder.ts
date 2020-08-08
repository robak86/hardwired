import { DependencyResolver } from '../resolvers/DependencyResolver';
import { ModuleId } from '../module-id';
import { ImmutableSet } from '../ImmutableSet';
import {
  AbstractDependencyResolver,
  AbstractRegistryDependencyResolver,
} from '../resolvers/AbstractDependencyResolver';
import { DependencyFactory } from '../draft';
import { RegistryRecord } from '../module/RegistryRecord';

export type ModuleBuilderMaterialized<T extends ModuleBuilder<any>> = T extends ModuleBuilder<infer TShape>
  ? TShape
  : never;

// prettier-ignore
export type DependencyResolverValue<TResolver extends DependencyResolver<any>> =
  TResolver extends AbstractDependencyResolver<infer TType> ? DependencyFactory<TType>  :
  TResolver extends AbstractRegistryDependencyResolver<infer TType> ? TType : never;

// export type DependencyFactories<T> = {
//   [K in keyof T]: DependencyFactory<T[K]>;
// };

// TODO: add some constraint on TRegistryRecord ?
export class ModuleBuilder<TRegistryRecord extends RegistryRecord> {
  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name));
  }

  protected constructor(public moduleId: ModuleId, public registry: ImmutableSet<any> = ImmutableSet.empty()) {}

  define<TKey extends string, T1 extends (ctx: TRegistryRecord) => DependencyResolver<any>>(
    name: TKey,
    resolver: T1,
  ): ModuleBuilder<TRegistryRecord & Record<TKey, DependencyResolverValue<ReturnType<T1>>>> {
    throw new Error('Implement me');
  }

  // append: ComposeDependencyResolvers<TRegistryRecord> = (
  //   ...entries: Array<(...args: any[]) => DependencyResolver<any, any>>
  // ): any => {
  //   return new ModuleBuilder(ModuleId.next(this.moduleId), [...this.entries, ...entries]);
  // };
  //
  // inject<TNextR extends RegistryRecord>(otherModule: ModuleBuilder<TNextR>): this {
  //   return new ModuleBuilder(ModuleId.next(this.moduleId), this.entries, [...this.injections, otherModule]) as any;
  // }
  //
  // replace<K extends keyof TRegistryRecord, C>(
  //   key: K,
  //   factory: (container: TRegistryRecord, C) => FilterPrivateFields<TRegistryRecord[K]>,
  // ): this {
  //   throw new Error('IUmplement me');
  //   // const newRegistry = this.registry.replace(key as any, new TransientResolver(factory as any));
  //   // return this.build(newRegistry) as any;
  // }

  toObject(): TRegistryRecord {
    throw new Error('DO NOT IMPLEMENT ME');
  }

  toSomething() {}
}

// export type ModuleBuilderRegistry<T> = T extends ModuleBuilder<infer TRegistryRecord> ? TRegistryRecord : never;
//
// class DummyClass {
//   constructor(private a: number, private b: boolean) {}
// }
//
// const entry = <TKey extends string, T1 extends (ctx: TContext) => DependencyResolver<TKey, any>, TContext>(
//   key: TKey,
//   factory: T1,
// ) => (ctx: TContext): T1 => {
//   throw new Error('implement me');
// };
//
// const modX = ModuleBuilder.empty('someModule').append(
//   use => transient('a', () => 1),
//   use => transient('a', () => 1),
//   use => transient('b', () => true),
// );
//
// const mod0 = ModuleBuilder.empty('someModule').append(
//   use => importModule('imported2', modX),
//   use => transient('a', () => 1),
//   use => transient('b', () => true),
//   use => transient('c', () => 'str'),
//   use => singleton('sing', DummyClass, [use.a, use.b]),
// );
//
// const mod = ModuleBuilder.empty('someModule').append(
//   use => importModule('imported', mod0),
//   use => fun('someFunction', (p: number) => true, [use.imported.a]),
//   use => transient('b', () => true),
//   use => transient('c', () => use.imported.a),
//   use => singleton('sing', DummyClass, [use.imported.a, use.b]),
// );

// const kurwa:WTF = null;

// const wtf = mod.toObject();
// .append(
//   [
//     //breakme
//     _ => transient('aa', () => 1),
//     _ => transient('ba', () => _.aa),
//   ],
//   // _ => transient('ca', () => _.z),
// );

// const mod2 = ModuleBuilder.empty('someOtherModule')
//   .append([
//     //breakme
//     _ => importModule('imported', mod),
//     _ => importModule('imported2', mod),
//   ])
//   .toObject();

// const mod2: any = null as any;

// const zz = mod(_ => ['name', transient(() => 1)]);
