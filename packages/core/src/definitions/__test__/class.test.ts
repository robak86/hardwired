import { expectType } from 'ts-expect';

import { container } from '../../container/Container.js';
import { cascading, scoped, singleton, transient } from '../def-symbol.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import type { MaybePromise } from '../../utils/async.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';

describe(`class`, () => {
  const numDef = transient<BoxedValue<number>>('num');
  const strDef = transient<BoxedValue<string>>('str');

  const numDefScoped = scoped<BoxedValue<number>>('num');
  const strDefScoped = scoped<BoxedValue<string>>('str');

  const numDefCascading = cascading<BoxedValue<number>>('num');
  const strDefCascading = cascading<BoxedValue<string>>('str');

  const myClassTransient = transient<MyClass>('MyClassTransient');
  const myClassSingleton = singleton<MyClass>('MyClassSingleton');
  const myClassScoped = scoped<MyClass>('MyClassScoped');
  const myClassCascading = cascading<MyClass>('MyClassCascading');

  class MyClass {
    readonly value = Math.random();

    constructor(
      public readonly num: BoxedValue<number>,
      public readonly str: BoxedValue<string>,
    ) {}
  }

  const syncConfig = configureContainer(c => {
    c.add(numDef).fn(() => new BoxedValue(123));
    c.add(strDef).fn(() => new BoxedValue('123'));

    c.add(myClassTransient).class(MyClass, numDef, strDef);
    c.add(myClassSingleton).class(MyClass, numDef, strDef);
    c.add(myClassScoped).class(MyClass, numDef, strDef);
    c.add(myClassCascading).class(MyClass, numDef, strDef);
  });

  const asyncConfig = configureContainer(c => {
    c.add(numDef).fn(async () => new BoxedValue(123));
    c.add(strDef).fn(async () => new BoxedValue('123'));

    c.add(myClassTransient).class(MyClass, numDef, strDef);
    c.add(myClassSingleton).class(MyClass, numDef, strDef);
    c.add(myClassScoped).class(MyClass, numDef, strDef);
    c.add(myClassCascading).class(MyClass, numDef, strDef);
  });

  describe(`types`, () => {
    it(`returns correct type`, async () => {
      const cnt = container.new(syncConfig);

      const instance = cnt.use(myClassTransient);

      expectType<MaybePromise<MyClass>>(instance);
    });

    it(`protects from using invalid scopes`, async () => {
      configureContainer(c => {
        // @ts-expect-error - singleton doesn't accept scoped dependencies
        c.add(myClassSingleton).class(MyClass, numDefScoped, strDefScoped);
      });
    });
  });

  describe(`resolution`, () => {
    describe(`sync resolution`, () => {
      it(`doesn't lift to async if all dependencies are sync`, async () => {
        const cnt = container.new(syncConfig);

        const instance = cnt.use(myClassTransient);

        expect(instance).toBeInstanceOf(MyClass);

        const awaited = await cnt.use(myClassTransient);

        expect(awaited.num.value).toBe(123);
        expect(awaited.str.value).toBe('123');
      });

      it(`throws when definition symbol is not registered`, async () => {
        const cnt = container.new();

        await expect(async () => {
          await cnt.use(myClassTransient);
        }).rejects.toThrow('Cannot find definition for Symbol(MyClassTransient)');
      });
    });

    describe(`async resolution`, () => {
      it(`lifts to Promise if some of dependencies are async`, async () => {
        const cnt = container.new(asyncConfig);

        const instance = cnt.use(myClassTransient);

        expect(instance).toBeInstanceOf(Promise);

        const awaited = await cnt.use(myClassTransient);

        expect(awaited.num.value).toBe(123);
        expect(awaited.str.value).toBe('123');
      });
    });
  });

  describe(`scopes`, () => {
    describe(`singleton`, () => {
      it(`returns always the same instance`, async () => {
        const cnt = container.new(syncConfig);

        const instance1 = await cnt.use(myClassSingleton);
        const instance2 = await cnt.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });

      it(`returns the same instance also fetched from the child scope`, async () => {
        const cnt = container.new(syncConfig);

        const instance1 = await cnt.use(myClassSingleton);
        const childScope = cnt.scope();

        const instance2 = await childScope.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });

      it(`propagates singleton to the root container`, async () => {
        const cnt = container.new(syncConfig);

        const childScope = cnt.scope();

        const instance2 = await childScope.use(myClassSingleton);
        const instance1 = await cnt.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });
    });

    describe(`transient`, () => {
      it(`returns always a new instance`, async () => {
        const cnt = container.new(syncConfig);

        const instance1 = await cnt.use(myClassTransient);
        const instance2 = await cnt.use(myClassTransient);

        expect(instance1).not.toBe(instance2);
      });
    });

    describe(`scoped`, () => {
      it(`returns the same instance within a scope`, async () => {
        const cnt = container.new(syncConfig);

        const instance1 = await cnt.use(myClassScoped);
        const instance2 = await cnt.use(myClassScoped);

        expect(instance1).toBe(instance2);

        const childScope = cnt.scope();

        const scopeInstance1 = await childScope.use(myClassScoped);
        const scopeInstance2 = await childScope.use(myClassScoped);

        expect(scopeInstance1).toBe(scopeInstance2);

        expect(instance1).not.toBe(scopeInstance1);
        expect(instance2).not.toBe(scopeInstance2);
      });
    });

    describe(`cascading`, () => {
      const config = configureContainer(c => {
        c.add(numDefCascading).fn(() => new BoxedValue(123));
        c.add(strDefCascading).fn(() => new BoxedValue('123'));
        c.add(myClassCascading).class(MyClass, numDefCascading, strDefCascading);
      });

      it(`is inherited by child scope`, async () => {
        const cnt = container.new(config);

        const childScope = cnt.scope();

        const instance1 = await cnt.use(myClassCascading);
        const instance2 = await childScope.use(myClassCascading);

        expect(instance1).toBe(instance2);
      });

      it(`is inherited until a child scope makes owning the definition`, async () => {
        const root = container.new(config);

        const scopeL1 = root.scope(s => s.own(numDefCascading));
        const scopeL2 = scopeL1.scope(s => s.own(myClassCascading));
        const scopeL3 = scopeL2.scope();

        expect(await root.use(numDefCascading)).toBe(await root.use(numDefCascading));

        // L1 owns numDefCascading
        expect(await root.use(numDefCascading)).not.toBe(await scopeL1.use(numDefCascading));
        expect(await scopeL1.use(numDefCascading)).toBe(await scopeL2.use(numDefCascading));
        expect(await scopeL2.use(numDefCascading)).toBe(await scopeL3.use(numDefCascading));

        // only root owns strDefCascading
        expect(await root.use(strDefCascading)).toBe(await scopeL1.use(strDefCascading));
        expect(await scopeL1.use(strDefCascading)).toBe(await scopeL2.use(strDefCascading));
        expect(await scopeL2.use(strDefCascading)).toBe(await scopeL3.use(strDefCascading));

        expect(await root.use(myClassCascading)).toBe(await scopeL1.use(myClassCascading));
        expect(await scopeL1.use(myClassCascading)).not.toBe(await scopeL2.use(myClassCascading));
        expect(await scopeL2.use(myClassCascading)).toBe(await scopeL3.use(myClassCascading));
      });
    });
  });
});
