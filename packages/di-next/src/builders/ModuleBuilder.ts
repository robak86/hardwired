import { transient } from '../resolvers/TransientResolver';
import { ComposeDependencyResolvers } from './ModuleBuilderCompose';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { ModuleId } from '../module-id';
import { RegistryRecord } from '../module/RegistryRecord';
import { FilterPrivateFields } from '../module/ModuleUtils';
import { ItemsRecords } from '../draft';
import { singleton } from '../resolvers/ClassSingletonResolver';
import { importModule } from '../resolvers/ImportResolver';

export type ModuleBuilderMaterialized<T extends ModuleBuilder<any>> = T extends ModuleBuilder<infer TShape>
  ? TShape
  : never;

export class ModuleBuilder<TRegistryRecord> {
  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name), []);
  }

  registry: any;

  protected constructor(
    public moduleId: ModuleId,
    public entries: Array<(...deps: any[]) => DependencyResolver<any, any>> = [],
    public injections: Array<ModuleBuilder<any>> = [],
  ) {}

  append: ComposeDependencyResolvers<TRegistryRecord> = (
    ...entries: Array<(...args: any[]) => DependencyResolver<any, any>>
  ) => {
    return new ModuleBuilder(ModuleId.next(this.moduleId), [...this.entries, ...entries]);
  };

  inject<TNextR extends RegistryRecord>(otherModule: ModuleBuilder<TNextR>): this {
    return new ModuleBuilder(ModuleId.next(this.moduleId), this.entries, [...this.injections, otherModule]) as any;
  }

  replace<K extends keyof TRegistryRecord, C>(
    key: K,
    factory: (container: TRegistryRecord, C) => FilterPrivateFields<TRegistryRecord[K]>,
  ): this {
    throw new Error('IUmplement me');
    // const newRegistry = this.registry.replace(key as any, new TransientResolver(factory as any));
    // return this.build(newRegistry) as any;
  }

  toObject(): TRegistryRecord {
    throw new Error('DO NOT IMPLEMENT ME');
  }

  toSomething() {}
}

// export type ModuleBuilderRegistry<T> = T extends ModuleBuilder<infer TRegistryRecord> ? TRegistryRecord : never;
//
class DummyClass {
  constructor(private a: number, private b: boolean) {}
}

const mod0 = ModuleBuilder.empty('someModule').append(
  use => transient('a', () => 1),
  use => transient('b', () => true),
  use => transient('c', () => 'str'),
  use => singleton('sing', DummyClass, [use.a, use.b]),
);

const mod = ModuleBuilder.empty('someModule').append(
  use => importModule('imported', mod0),
  use => transient('b', () => true),
  use => transient('c', () => 'str'),
  // use => singleton('sing', DummyClass, () => [use.imported, use.b]),
);

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
