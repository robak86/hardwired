import { Module, module } from '../Module';
import { external } from '../../builders/RequireBuilder';
import { expectType, TypeEqual } from 'ts-expect';
import { Container, container } from '../../container/Container';
import { Definition, RequiresDefinition } from '../ModuleRegistry';
import { singletonDefines, SingletonBuilder } from '../../builders/SingletonBuilder';
import { imports } from '../../builders/ImportsBuilder';
import { ModuleBuilder, ModuleBuilderRegistry } from '../../builders/ModuleBuilder';

describe(`Module`, () => {
  describe(`.hasModule`, () => {
    it(`returns true if there is a module registered for given key`, async () => {
      let otherModule = module('someName');
      let rootModule = module('someOtherModule').using(imports).import('otherModule', otherModule);

      expect(rootModule.hasModule('otherModule')).toEqual(true);
    });

    it(`returns false if module is missing`, async () => {
      let otherModule = module('otherModule');
      expect((otherModule as any).hasModule('otherModule')).toEqual(false);
    });

    it(`returns new instance of module (doesn't mutate original module)`, async () => {});
  });

  describe(`.imports`, () => {
    it(`doesn't mutate original module`, async () => {
      let childModule1 = module('child1');
      let childModule2 = module('child2');

      let rootModule = module('someOtherModule').using(imports).import('c1', childModule1);

      let updatedRoot = rootModule.import('c2', childModule2);

      expect((<any>rootModule).hasModule('c2')).toEqual(false);
    });

    it(`supports thunks`, async () => {
      let childModule1 = module('child1');
      let rootModule = module('someOtherModule')
        .using(imports)
        .import('c1', () => childModule1);

      expect(rootModule.hasModule('c1')).toEqual(true);
    });
  });

  describe(`.define`, () => {
    describe(`types`, () => {
      it(`creates correct types`, async () => {
        const m = module('m1')
          .using(singletonDefines)
          .define('number', () => 123)
          .define('string', () => 'str');

        expectType<TypeEqual<typeof m, SingletonBuilder<{ number: Definition<number>; string: Definition<string> }>>>(
          true,
        );
      });

      it(`does not allow duplicates`, async () => {
        const m = module<{ externalDependency: number }>('m1')
          .using(singletonDefines)
          .define('number', () => 123)
          .define('number', () => 'str');

        expectType<TypeEqual<typeof m, 'Module contains duplicated definitions'>>(true);
      });
    });

    it(`registers new dependency resolver`, async () => {
      class SomeType {
        public a!: string;
      }

      let m1 = module('otherModule')
        .using(singletonDefines)
        .define('someType', () => new SomeType());

      expect(m1.isDeclared('someType')).toEqual(true);
    });

    it(`does not mutate original module`, async () => {
      let m1 = module('m1')
        .using(singletonDefines)
        .define('someType', () => true);

      let m2 = m1.define('someNewType', () => 123);

      expect(m1.isDeclared('someNewType' as any)).toEqual(false);
      expect(m2.isDeclared('someNewType')).toEqual(true);
      expect(m2.isDeclared('someType')).toEqual(true);
    });

    it(`returns new instance of module (doesn't mutate original module)`, async () => {});
  });

  describe(`.require`, () => {
    describe(`types`, () => {
      it(`creates modules with correct type`, async () => {
        const m = module('m').using(external).require<{ dependency1: number }>();
        expectType<TypeEqual<ModuleBuilderRegistry<typeof m>, { dependency1: RequiresDefinition<number> }>>(true);
      });

      it(`aggregates all dependencies from imported modules`, async () => {
        const m = module('m').using(external).require<{ dependency1: number }>();
        const m2 = module('m2').using(external).require<{ dependency2: number }>().using(imports).import('imported', m);
        expectType<
          TypeEqual<
            ModuleBuilderRegistry<typeof m2>,
            {
              dependency2: RequiresDefinition<number>;
              imported: ModuleBuilder<ModuleBuilderRegistry<typeof m>>;
            }
          >
        >(true);
      });
    });
  });

  describe(`.toContainer`, () => {
    describe(`types`, () => {
      it(`produces container with correct types`, async () => {
        let m = module('m1')
          .using(singletonDefines)
          .define('a', () => 1)
          .define('b', () => '2');

        const c1 = container(m);
        expectType<TypeEqual<typeof c1, Container<{ a: Definition<number>; b: Definition<string> }>>>(true);
      });
    });
  });

  describe(`.replace`, () => {
    it(`replaces declaration`, async () => {
      let m1 = module('m1')
        .using(singletonDefines)
        .define('a', () => 1);

      let updated = m1.replace('a', () => 2);
      expect(container(updated).get('a')).toEqual(2);
    });
  });

  describe(`.get`, () => {
    class T1 {
      id = Math.random();
      type: string = 't1';
    }

    class T2 {
      id = Math.random();
      type: string = 't2';
    }

    describe(`instances declared in current module`, () => {
      it(`returns registered dependency`, async () => {
        let m1 = module('m1')
          .using(singletonDefines)
          .define('t1', () => new T1())
          .define('t2', () => new T2())
          .define('t1_t2', c => {
            return [c.t1, c.t2];
          });

        let materializedContainer = container(m1);

        expect(materializedContainer.get('t1').type).toEqual('t1');
        expect(materializedContainer.get('t2').type).toEqual('t2');
        expect(materializedContainer.get('t1_t2').map(t => t.type)).toEqual(['t1', 't2']);

        expect([materializedContainer.get('t1').id, materializedContainer.get('t2').id]).toEqual(
          materializedContainer.get('t1_t2').map(t => t.id),
        );
      });
    });

    describe(`.getDeep`, () => {
      it(`returns instance from other module`, async () => {
        let a = module('1')
          .using(singletonDefines)
          .define('t1', () => new T1());

        let b = module('1')
          .using(imports)
          .import('a', a)
          .using(singletonDefines)
          .define('t1', () => new T1());

        const t1 = container(b).deepGet(a, 't1');

        expect(t1.type).toEqual('t1');
      });
    });

    describe(`instances fetched from submodules`, () => {
      it(`returns registered dependency`, async () => {
        let childM = module('1')
          .using(singletonDefines)
          .define('t1', () => new T1())
          .define('t2', () => new T2());

        let m1 = module('2')
          .using(imports)
          .import('childModule', childM)
          .using(singletonDefines)
          .define('sdf', ctx => ctx.childModule)
          .define('t1', () => new T1())
          .define('t2', () => new T2())
          .define('t1FromChildModule', c => c.childModule.t1)
          .define('t2FromChildModule', c => c.childModule.t2)
          .define('t1WithChildT1', p => [p.t1, p.childModule.t1])
          .define('t2WithChildT2', p => [p.t1, p.childModule.t2]);

        let cont = container(m1, {});
        expect(cont.get('t1FromChildModule').id).toEqual(cont.deepGet(childM, 't1').id);
        expect(cont.get('t2FromChildModule').id).toEqual(cont.deepGet(childM, 't2').id);
      });
    });

    describe(`using enums`, () => {
      it(`works`, async () => {
        const m1 = module('m1');
      });
    });

    describe(`dependencies resolution`, () => {
      describe(`.toObject`, () => {
        it(`returns proxy object able for getting all dependencies`, async () => {
          let m1 = module('m1')
            .using(singletonDefines)
            .define('v1', () => 1)
            .define('v2', () => 2);

          let m2 = module('m2')
            .using(imports)
            .import('m1', () => m1)
            .using(singletonDefines)
            .define('ov1', () => 10)
            .define('s2', () => 11);

          const obj = container(m2).asObject();
          expect(obj.s2).toEqual(11);
          expect(obj.m1.v1).toEqual(1);
        });
      });

      describe(`.getMany`, () => {
        it(`returns all dependencies`, async () => {
          let m1 = module('m1')
            .using(singletonDefines)
            .define('s1', () => 1)
            .define('s2', () => 'str');

          const [s1, s2] = container(m1).getMany('s1', 's2');

          expect(s1).toEqual(1);
          expect(s2).toEqual('str');
        });
      });

      it(`resolves all dependencies lazily`, async () => {
        let f1 = jest.fn().mockReturnValue(() => 123);
        let f2 = jest.fn().mockReturnValue(() => 456);
        let f3 = jest.fn().mockReturnValue(() => 678);
        let f4 = jest.fn().mockReturnValue(() => 9);

        let m1 = module('m1') //breakme
          .using(singletonDefines)
          .define('s3', f3)
          .define('s4', f4);

        let m2 = module('m2') //breakme
          .using(imports)
          .import('m1', m1)
          .using(singletonDefines)
          .define('s1', f1)
          .define('s2', f2);

        let cnt = container(m2);

        cnt.get('s1');
        expect(f1).toBeCalledTimes(1);

        expect(f2).toBeCalledTimes(0);
        expect(f3).toBeCalledTimes(0);
        expect(f4).toBeCalledTimes(0);
      });

      it(`caches all initialized dependencies`, async () => {
        let f1 = jest.fn().mockReturnValue(() => 123);
        let f2 = jest.fn().mockReturnValue(() => 456);
        let f3 = jest.fn().mockReturnValue(() => 678);
        let f4 = jest.fn().mockReturnValue(() => 9);
        let f5 = jest.fn().mockReturnValue(() => 9);
        let f6 = jest.fn().mockReturnValue(() => 9);

        let c = module('c')
          .using(singletonDefines)
          .define('f1', f1)
          .define('f2', f2)
          .define('f1+f2', ({ f1, f2 }) => f1 + f2);

        let b = module('b')
          .using(imports)
          .import('c', c)
          .using(singletonDefines)
          .define('f3', f3)
          .define('f4', f4)
          .define('f3+f4', ({ f3, f4 }) => f3 + f4)
          .define('f1+f2+f3+f4', _ => _.c.f1 + _.c.f2 + _.f3 + _.f3);

        let a = module('a')
          .using(imports)
          .import('b', b)
          .import('c', c)
          .using(singletonDefines)
          .define('f5', f5)
          .define('f6', f6)
          .define('f5+f1', _ => _.c.f1 + _.f5)
          .define('f6+f2', _ => _.c.f2 + _.f6);

        let cnt = container(a, {});

        // container.get("b");
        // container.get("c");
        cnt.get('f5');
        cnt.get('f6');
        cnt.get('f5+f1');
        cnt.get('f6+f2');
        cnt.deepGet(b, 'f3');
        cnt.deepGet(b, 'f4');
        cnt.deepGet(b, 'f3+f4');
        cnt.deepGet(b, 'f1+f2+f3+f4');
        cnt.deepGet(c, 'f1');
        cnt.deepGet(c, 'f2');
        cnt.deepGet(c, 'f1+f2');

        expect(f1).toBeCalledTimes(1);
        expect(f2).toBeCalledTimes(1);
        expect(f3).toBeCalledTimes(1);
        expect(f4).toBeCalledTimes(1);
        expect(f5).toBeCalledTimes(1);
        expect(f6).toBeCalledTimes(1);
      });

      it(`calls all dependencies factory functions with correct context`, async () => {
        let f1 = jest.fn().mockReturnValue((...args: any[]) => 123);
        let f2 = jest.fn().mockReturnValue((...args: any[]) => 456);
        let f3 = jest.fn().mockReturnValue((...args: any[]) => 678);
        let f4 = jest.fn().mockReturnValue((...args: any[]) => 9);

        let m1 = module('m1').using(singletonDefines).define('s3', f3).define('s4', f4);

        let m2 = module('m2')
          .using(imports)
          .import('m1', m1)
          .using(singletonDefines)
          .define('s1', f1)
          .define('s2', f2)
          .define('s3_s1', c => [c.m1.s3, c.s1])
          .define('s4_s2', c => [c.m1.s4, c.s2]);

        let cnt = container(m2, { someCtxVal: 1 });

        cnt.get('s1');
        cnt.get('s1');
        cnt.get('s3_s1');
        cnt.get('s4_s2');
        cnt.deepGet(m1, 's3');
        cnt.deepGet(m1, 's4');

        expect(f1.mock.calls[0][0].someCtxVal).toEqual(1);
        expect(f2.mock.calls[0][0].someCtxVal).toEqual(1);
        expect(f3.mock.calls[0][0].someCtxVal).toEqual(1);
        expect(f4.mock.calls[0][0].someCtxVal).toEqual(1);
      });

      //TODO: Maximum call stack size exceeded
      it.skip(`properly resolvers circular dependencies`, async () => {
        let m1 = module('m1')
          .using(singletonDefines)
          .define('i', () => 1)
          .define('a', (c: any) => c.i + c.b)
          .define('b', (c: any) => c.i + c.a);

        let container1 = container(m1, {});
        container1.get('a');
      });
    });
  });

  describe(`.inject`, () => {
    it(`replaces all related modules in whole tree`, async () => {
      let m1 = module('m1')
        .using(singletonDefines)
        .define('val', () => 1);

      let m2 = module('m2')
        .using(imports)
        .import('child', m1)
        .using(singletonDefines)
        .define('valFromChild', c => c.child.val);

      let m3 = module('m3')
        .using(imports)
        .import('child1', m1)
        .import('child2', m2)
        .using(singletonDefines)
        .define('val', c => c.child2.valFromChild);

      // const a = m2.toContainer({}).flatten();

      // type ZZZ = FlattenModules<typeof m3.debug>;
      // type ZZZZZ = ImportsKeys<typeof m3.debug>;
      // type Def = Definitions<typeof m3.debug>;
      // type Imp = Imports<typeof m3.debug>;

      // m2.toContainer({}).deepGet(m2, 'valFromChild');
      // m2.toContainer({}).deepGet(m1, 'val');

      let m1Overrides = m1.replace('val', c => 2);

      let mocked = m3.inject(m1Overrides);

      expect(container(mocked, {}).get('val')).toEqual(2);
      expect(container(mocked, {}).deepGet(m1, 'val')).toEqual(2);
      expect(container(mocked, {}).deepGet(m2, 'valFromChild')).toEqual(2);
      expect(container(mocked, {}).deepGet(m1, 'val')).toEqual(2);
      expect(m3).not.toEqual(mocked);
    });
  });
});
