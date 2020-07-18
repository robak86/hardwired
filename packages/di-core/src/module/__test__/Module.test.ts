import { Module, module } from '../Module';
import { expectType, TypeEqual } from 'ts-expect';
import { Container, container } from '../../container/Container';
import { Definition, RequiresDefinition } from '../ModuleRegistry';

import { ModuleBuilder, ModuleBuilderRegistry } from '../../builders/ModuleBuilder';
import { CommonBuilder, commonDefines } from '../../builders/CommonDefines';

describe(`Module`, () => {
  function createClass<TType extends string>(type: TType, randomizeInstance = true) {
    const spy = jest.fn().mockReturnValue(type);
    const Klass = class {
      public type: TType = spy();
      public id = randomizeInstance ? Math.random() : 0;
      constructor() {}
    };
    return { Klass, spy };
  }

  class WildCardConsumer {
    public deps: any[];

    constructor(...deps: any[]) {
      this.deps = deps;
    }
  }

  class T1 {
    t1 = 't1';
  }
  class T2 {
    t2 = 't2';
  }

  class ConsumerAny {
    public args: any[];
    constructor(...args: any[]) {
      this.args = args;
    }
  }

  describe(`.using`, () => {
    it(`creates module with correct TRegistry`, async () => {
      const m: ModuleBuilder<{ a: Definition<number> }> = module('someModule') as any;
      const nextModule = m.using(commonDefines);
      expectType<TypeEqual<ModuleBuilderRegistry<typeof nextModule>, { a: Definition<number> }>>(true);
    });
  });

  describe(`.hasModule`, () => {
    it(`returns true if there is a module registered for given key`, async () => {
      let otherModule = module('someName');
      let rootModule = module('someOtherModule').import('otherModule', otherModule);

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

      let rootModule = module('someOtherModule').import('c1', childModule1);

      let updatedRoot = rootModule.import('c2', childModule2);

      expect((<any>rootModule).hasModule('c2')).toEqual(false);
    });

    it(`supports thunks`, async () => {
      let childModule1 = module('child1');
      let rootModule = module('someOtherModule').import('c1', () => childModule1);

      expect(rootModule.hasModule('c1')).toEqual(true);
    });
  });

  describe(`.define`, () => {
    describe(`types`, () => {
      it(`creates correct types`, async () => {
        const m = module('m1').singleton('number', T1).singleton('string', T2);

        expectType<TypeEqual<typeof m, CommonBuilder<{ number: Definition<T1>; string: Definition<T2> }>>>(true);
      });

      it(`does not allow duplicates`, async () => {
        const { Klass: F1Class } = createClass('1');
        const { Klass: F2Class } = createClass('2');

        const m = module<{ externalDependency: number }>('m1')
          .singleton('number', F1Class)
          .singleton('number', F2Class);

        expectType<TypeEqual<typeof m, 'Module contains duplicated definitions'>>(true);
      });
    });

    it(`registers new dependency resolver`, async () => {
      class SomeType {
        public a!: string;
      }

      let m1 = module('otherModule').singleton('someType', SomeType);

      expect(m1.isDeclared('someType')).toEqual(true);
    });

    it(`does not mutate original module`, async () => {
      class SomeType {}

      let m1 = module('m1').singleton('someType', SomeType);

      let m2 = m1.singleton('someNewType', SomeType);

      expect(m1.isDeclared('someNewType' as any)).toEqual(false);
      expect(m2.isDeclared('someNewType')).toEqual(true);
      expect(m2.isDeclared('someType')).toEqual(true);
    });

    it(`returns new instance of module (doesn't mutate original module)`, async () => {});
  });

  describe(`.require`, () => {
    describe(`types`, () => {
      it(`creates modules with correct type`, async () => {
        const m = module('m').external<{ dependency1: number }>();
        expectType<TypeEqual<ModuleBuilderRegistry<typeof m>, { dependency1: RequiresDefinition<number> }>>(true);
      });

      it(`aggregates all dependencies from imported modules`, async () => {
        const m = module('m').external<{ dependency1: number }>();
        const m2 = module('m2').external<{ dependency2: number }>().import('imported', m);
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
        class A {}
        class B {}

        let m = module('m1').singleton('a', A).singleton('b', B);

        const c1 = container(m);
        expectType<TypeEqual<typeof c1, Container<{ a: Definition<A>; b: Definition<B> }>>>(true);
      });
    });
  });

  describe(`.replace`, () => {
    it(`replaces declaration`, async () => {
      class A {}
      class A2 {}

      let m1 = module('m1').singleton('a', A);

      let updated = m1.replace('a', () => new A2());
      expect(container(updated).get('a')).toBeInstanceOf(A2);
    });
  });

  describe(`.get`, () => {
    class T1 {
      id = Math.random();
      type: string = 't1';
    }

    class T2 {
      id = Math.random();
      type: number = 123;
    }

    class Consumer {
      constructor(public t1: T1, public t2: T2) {}
    }

    describe(`instances declared in current module`, () => {
      it(`returns registered dependency`, async () => {
        const { Klass: T1Class } = createClass('t1', false);
        const { Klass: T2Class } = createClass('t2', false);

        let m1 = module('m1')
          .singleton('t1', T1Class)
          .singleton('t2', T2Class)
          .singleton('t1_t2', WildCardConsumer, c => [c.t1, c.t2]);

        let materializedContainer = container(m1);

        expect(materializedContainer.get('t1').type).toEqual('t1');
        expect(materializedContainer.get('t2').type).toEqual('t2');
        expect(materializedContainer.get('t1_t2').deps[0]).toBeInstanceOf(T1Class);
        expect(materializedContainer.get('t1_t2').deps[1]).toBeInstanceOf(T2Class);

        expect([materializedContainer.get('t1').id, materializedContainer.get('t2').id]).toEqual([
          materializedContainer.get('t1_t2').deps[0].id,
          materializedContainer.get('t1_t2').deps[1].id,
        ]);
      });
    });

    describe(`.getDeep`, () => {
      it(`returns instance from other module`, async () => {
        let a = module('1').singleton('t1', T1);

        let b = module('1').import('a', a).singleton('t1', T1);

        const t1 = container(b).deepGet(a, 't1');

        expect(t1.type).toEqual('t1');
      });
    });

    describe(`instances fetched from submodules`, () => {
      it(`returns registered dependency`, async () => {
        let childM = module('1').singleton('t1', T1).singleton('t2', T2);

        let m1 = module('2')
          .import('childModule', childM)
          .singleton('sdf', ConsumerAny, ctx => [ctx.childModule])
          .singleton('t1', T1)
          .singleton('t2', T2)
          .singleton('t1FromChildModule', ConsumerAny, c => [c.childModule.t1])
          .singleton('t2FromChildModule', ConsumerAny, c => [c.childModule.t2])
          .singleton('t1WithChildT1', ConsumerAny, p => [p.t1, p.childModule.t1])
          .singleton('t2WithChildT2', ConsumerAny, p => [p.t1, p.childModule.t2]);

        let cont = container(m1, {});
        expect(cont.get('t1FromChildModule').args[0].id).toEqual(cont.deepGet(childM, 't1').id);
        expect(cont.get('t2FromChildModule').args[0].id).toEqual(cont.deepGet(childM, 't2').id);
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
          let m1 = module('m1').singleton('v1', T1).singleton('v2', T2);

          let m2 = module('m2')
            .import('m1', () => m1)
            .singleton('ov1', T1)
            .singleton('s2', T2);

          const obj = container(m2).asObject();
          expect(obj.s2).toBeInstanceOf(T2);
          expect(obj.m1.v1).toBeInstanceOf(T1);
        });
      });

      describe(`.getMany`, () => {
        it(`returns all dependencies`, async () => {
          let m1 = module('m1').singleton('s1', T1).singleton('s2', T2);

          const [s1, s2] = container(m1).getMany('s1', 's2');

          expect(s1).toBeInstanceOf(T1);
          expect(s2).toBeInstanceOf(T2);
        });
      });

      it(`resolves all dependencies lazily`, async () => {
        let f1 = jest.fn().mockReturnValue(() => 123);
        let f2 = jest.fn().mockReturnValue(() => 456);
        let f3 = jest.fn().mockReturnValue(() => 678);
        let f4 = jest.fn().mockReturnValue(() => 9);

        let m1 = module('m1') //breakme
          .singleton('s3', f3)
          .singleton('s4', f4);

        let m2 = module('m2') //breakme
          .import('m1', m1)
          .singleton('s1', f1)
          .singleton('s2', f2);

        let cnt = container(m2);

        cnt.get('s1');
        expect(f1).toBeCalledTimes(1);

        expect(f2).toBeCalledTimes(0);
        expect(f3).toBeCalledTimes(0);
        expect(f4).toBeCalledTimes(0);
      });

      it(`caches all initialized dependencies`, async () => {
        const { Klass: F1Class, spy: f1 } = createClass('123');
        const { Klass: F2Class, spy: f2 } = createClass('456');
        const { Klass: F3Class, spy: f3 } = createClass('678');
        const { Klass: F4Class, spy: f4 } = createClass('9');
        const { Klass: F5Class, spy: f5 } = createClass('9');
        const { Klass: F6Class, spy: f6 } = createClass('9');

        const c = module('c')
          .singleton('f1', F1Class)
          .singleton('f2', F2Class)
          .singleton('f1+f2', WildCardConsumer, ({ f1, f2 }) => [f1, f2]);

        const b = module('b')
          .import('c', c)
          .singleton('f3', F3Class)
          .singleton('f4', F4Class)
          .singleton('f3+f4', WildCardConsumer, ({ f3, f4 }) => [f3, f4])
          .singleton('f1+f2+f3+f4', WildCardConsumer, _ => [_.c.f1, _.c.f2, _.f3, _.f3]);

        const a = module('a')
          .import('b', b)
          .import('c', c)
          .singleton('f5', F5Class)
          .singleton('f6', F6Class)
          .singleton('f5+f1', WildCardConsumer, _ => [_.c.f1, _.f5])
          .singleton('f6+f2', WildCardConsumer, _ => [_.c.f2, _.f6]);

        const cnt = container(a, {});

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
        const { Klass: F1Class } = createClass('123');
        const { Klass: F2Class } = createClass('456');
        const { Klass: F3Class } = createClass('678');
        const { Klass: F4Class } = createClass('9');

        const f1DepsSelect = jest.fn().mockReturnValue([]);
        const f2DepsSelect = jest.fn().mockReturnValue([]);
        const f3DepsSelect = jest.fn().mockReturnValue([]);
        const f4DepsSelect = jest.fn().mockReturnValue([]);

        let m1 = module('m1').singleton('s3', F3Class, f3DepsSelect).singleton('s4', F4Class, f4DepsSelect);

        let m2 = module('m2')
          .import('m1', m1)
          .singleton('s1', F1Class, f1DepsSelect)
          .singleton('s2', F2Class, f2DepsSelect)
          .singleton('s3_s1', WildCardConsumer, c => [c.m1.s3, c.s1])
          .singleton('s4_s2', WildCardConsumer, c => [c.m1.s4, c.s2]);

        let cnt = container(m2, { someCtxVal: 1 });

        cnt.get('s1');
        cnt.get('s1');
        cnt.get('s3_s1');
        cnt.get('s4_s2');
        cnt.deepGet(m1, 's3');
        cnt.deepGet(m1, 's4');

        expect(f1DepsSelect.mock.calls[0][0].someCtxVal).toEqual(1);
        expect(f2DepsSelect.mock.calls[0][0].someCtxVal).toEqual(1);
        expect(f3DepsSelect.mock.calls[0][0].someCtxVal).toEqual(1);
        expect(f4DepsSelect.mock.calls[0][0].someCtxVal).toEqual(1);
      });

      //TODO: Maximum call stack size exceeded
      // it.skip(`properly resolvers circular dependencies`, async () => {
      //   let m1 = module('m1')
      //     .singleton('i', () => 1)
      //     .singleton('a', (c: any) => c.i + c.b)
      //     .singleton('b', (c: any) => c.i + c.a);
      //
      //   let container1 = container(m1, {});
      //   container1.get('a');
      // });
    });
  });

  describe(`.inject`, () => {
    it(`replaces all related modules in whole tree`, async () => {
      const { Klass: F1Class } = createClass('123', false);
      const { Klass: F2Class } = createClass('456', false);

      const m1 = module('m1').singleton('val', F1Class);

      const m2 = module('m2')
        .import('child', m1)
        .singleton('valFromChild', WildCardConsumer, c => [c.child.val]);

      const m3 = module('m3')
        .import('child1', m1)
        .import('child2', m2)
        .singleton('val', WildCardConsumer, c => [c.child2.valFromChild]);

      const m1Overrides = m1.replace('val', c => new F2Class() as any);

      const mocked = m3.inject(m1Overrides);

      expect(container(mocked, {}).get('val')).toEqual({ deps: [{ deps: [new F2Class()] }] });
      expect(container(mocked, {}).deepGet(m1, 'val')).toEqual(new F2Class());
      expect(container(mocked, {}).deepGet(m2, 'valFromChild')).toEqual({ deps: [new F2Class()] });
      expect(container(mocked, {}).deepGet(m1, 'val')).toEqual(new F2Class());
      expect(m3).not.toEqual(mocked);
    });
  });
});
