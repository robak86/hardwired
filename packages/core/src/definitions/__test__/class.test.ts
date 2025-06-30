import { expectType } from 'ts-expect';

import { container } from '../../container/Container.js';
import { cascading, scoped, singleton, transient } from '../tokens.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';

describe(`class`, () => {
  const numDef = transient.token<BoxedValue<number>>('num');
  const strDef = transient.token<BoxedValue<string>>('str');

  const numDefScoped = scoped.token<BoxedValue<number>>('num');
  const strDefScoped = scoped.token<BoxedValue<string>>('str');

  const numDefCascading = cascading.token<BoxedValue<number>>('num');
  const strDefCascading = cascading.token<BoxedValue<string>>('str');

  const numDefSingleton = singleton.token<BoxedValue<number>>('num');
  const strDefSingleton = singleton.token<BoxedValue<string>>('str');

  const myClassTransient = transient.token<MyClass>('MyClassTransient');
  const myClassSingleton = singleton.token<MyClass>('MyClassSingleton');
  const myClassScoped = scoped.token<MyClass>('MyClassScoped');
  const myClassCascading = cascading.token<MyClass>('MyClassCascading');

  const numDefAsync = transient.token<Promise<BoxedValue<number>>>('num');
  const strDefAsync = transient.token<Promise<BoxedValue<string>>>('str');

  const numDefScopedAsync = scoped.token<Promise<BoxedValue<number>>>('num');
  const strDefScopedAsync = scoped.token<Promise<BoxedValue<string>>>('str');

  const numDefCascadingAsync = cascading.token<Promise<BoxedValue<number>>>('num');
  const strDefCascadingAsync = cascading.token<Promise<BoxedValue<string>>>('str');

  const numDefSingletonAsync = singleton.token<Promise<BoxedValue<number>>>('num');
  const strDefSingletonAsync = singleton.token<Promise<BoxedValue<string>>>('str');

  const myClassTransientAsync = transient.token<Promise<MyClass>>('MyClassTransient');
  const myClassSingletonAsync = singleton.token<Promise<MyClass>>('MyClassSingleton');
  const myClassScopedAsync = scoped.token<Promise<MyClass>>('MyClassScoped');
  const myClassCascadingAsync = cascading.token<Promise<MyClass>>('MyClassCascading');

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

    c.add(numDefSingleton).fn(() => new BoxedValue(123));
    c.add(strDefSingleton).fn(() => new BoxedValue('123'));

    c.add(numDefScoped).fn(() => new BoxedValue(123));
    c.add(strDefScoped).fn(() => new BoxedValue('123'));

    c.add(numDefCascading).fn(() => new BoxedValue(123));
    c.add(strDefCascading).fn(() => new BoxedValue('123'));

    c.add(myClassTransient)
      .using(numDef, strDef)
      .fn((num, str) => new MyClass(num, str));
    c.add(myClassSingleton)
      .using(numDefSingleton, strDefSingleton)
      .fn((num, str) => new MyClass(num, str));
    c.add(myClassScoped)
      .using(numDefScoped, strDefScoped)
      .fn((num, str) => new MyClass(num, str));
    c.add(myClassCascading)
      .using(numDefCascading, strDefCascading)
      .fn((num, str) => new MyClass(num, str));
  });

  const asyncConfig = configureContainer(c => {
    c.add(numDefAsync).fn(async () => new BoxedValue(123));
    c.add(strDefAsync).fn(async () => new BoxedValue('123'));

    c.add(numDefSingletonAsync).fn(async () => new BoxedValue(123));
    c.add(strDefSingletonAsync).fn(async () => new BoxedValue('123'));

    c.add(numDefScopedAsync).fn(async () => new BoxedValue(123));
    c.add(strDefScopedAsync).fn(async () => new BoxedValue('123'));

    c.add(numDefCascadingAsync).fn(async () => new BoxedValue(123));
    c.add(strDefCascadingAsync).fn(async () => new BoxedValue('123'));

    c.add(myClassTransientAsync)
      .using(numDefAsync, strDefAsync)
      .fn(async (num, str) => new MyClass(num, str));

    c.add(myClassSingletonAsync)
      .using(numDefSingletonAsync, strDefSingletonAsync)
      .fn(async (num, str) => new MyClass(num, str));

    c.add(myClassScopedAsync)
      .using(numDefScopedAsync, strDefScopedAsync)
      .fn(async (num, str) => new MyClass(num, str));

    c.add(myClassCascadingAsync)
      .using(numDefCascadingAsync, strDefCascadingAsync)
      .fn(async (num, str) => new MyClass(num, str));
  });

  describe(`types`, () => {
    it(`returns correct type`, async () => {
      const cnt = container(asyncConfig, syncConfig);

      const instance = cnt.use(myClassTransient);
      const asyncInstance = await cnt.use(myClassTransientAsync);

      expectType<MyClass>(instance);
      expectType<MyClass>(asyncInstance);
    });

    it(`protects from using invalid scopes`, async () => {
      configureContainer(c => {
        // @ts-expect-error - singleton doesn't accept scoped dependencies
        c.add(myClassSingleton).fn((num, str) => new MyClass(num, str), numDefScoped, strDefScoped);
      });
    });
  });

  describe(`resolution`, () => {
    describe(`sync resolution`, () => {
      it(`doesn't lift to async if all dependencies are sync`, async () => {
        const cnt = container(syncConfig);

        const instance = cnt.use(myClassTransient);

        expect(instance).toBeInstanceOf(MyClass);

        const awaited = cnt.use(myClassTransient);

        expect(awaited.num.value).toBe(123);
        expect(awaited.str.value).toBe('123');
      });

      it(`throws when definition symbol is not registered`, async () => {
        const cnt = container();

        await expect(() => {
          cnt.use(myClassTransient);
        }).toThrow('Cannot find definition for Symbol(MyClassTransient)');
      });
    });

    describe(`async resolution`, () => {
      it(`lifts to Promise if some of dependencies are async`, async () => {
        const cnt = container(asyncConfig, syncConfig);

        const awaited = await cnt.use(myClassTransientAsync);

        expect(awaited.num.value).toBe(123);
        expect(awaited.str.value).toBe('123');
      });
    });
  });

  describe(`scopes`, () => {
    describe(`singleton`, () => {
      it(`returns always the same instance`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassSingleton);
        const instance2 = cnt.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });

      it(`returns the same instance also fetched from the child scope`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassSingleton);
        const childScope = cnt.scope();

        const instance2 = childScope.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });
    });

    describe(`transient`, () => {
      it(`returns always a new instance`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassTransient);
        const instance2 = cnt.use(myClassTransient);

        expect(instance1).not.toBe(instance2);
      });
    });

    describe(`scoped`, () => {
      it(`returns the same instance within a scope`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassScoped);
        const instance2 = cnt.use(myClassScoped);

        expect(instance1).toBe(instance2);

        const childScope = cnt.scope();

        const scopeInstance1 = childScope.use(myClassScoped);
        const scopeInstance2 = childScope.use(myClassScoped);

        expect(scopeInstance1).toBe(scopeInstance2);

        expect(instance1).not.toBe(scopeInstance1);
        expect(instance2).not.toBe(scopeInstance2);
      });
    });

    describe(`cascading`, () => {
      const config = configureContainer(c => {
        c.add(numDefCascading).fn(() => new BoxedValue(123));
        c.add(strDefCascading).fn(() => new BoxedValue('123'));
        c.add(myClassCascading)
          .using(numDefCascading, strDefCascading)
          .fn((num, str) => new MyClass(num, str));
      });

      it(`is inherited by child scope`, async () => {
        const cnt = container(config);

        const childScope = cnt.scope();

        const instance1 = cnt.use(myClassCascading);
        const instance2 = childScope.use(myClassCascading);

        expect(instance1).toBe(instance2);
      });

      it(`is inherited until a child scope makes owning the definition`, async () => {
        const root = container(config);

        const scopeL1 = root.scope(s => s.modify(numDefCascading).claimNew());
        const scopeL2 = scopeL1.scope(s => s.modify(myClassCascading).claimNew());
        const scopeL3 = scopeL2.scope();

        expect(root.use(numDefCascading)).toBe(root.use(numDefCascading));

        // L1 owns numDefCascading
        expect(root.use(numDefCascading)).not.toBe(scopeL1.use(numDefCascading));
        expect(scopeL1.use(numDefCascading)).toBe(scopeL2.use(numDefCascading));
        expect(scopeL2.use(numDefCascading)).toBe(scopeL3.use(numDefCascading));

        // only root owns strDefCascading
        expect(root.use(strDefCascading)).toBe(scopeL1.use(strDefCascading));
        expect(scopeL1.use(strDefCascading)).toBe(scopeL2.use(strDefCascading));
        expect(scopeL2.use(strDefCascading)).toBe(scopeL3.use(strDefCascading));

        expect(root.use(myClassCascading)).toBe(scopeL1.use(myClassCascading));
        expect(scopeL1.use(myClassCascading)).not.toBe(scopeL2.use(myClassCascading));
        expect(scopeL2.use(myClassCascading)).toBe(scopeL3.use(myClassCascading));
      });
    });
  });

  describe(`types2`, () => {
    it(`returns correct type`, async () => {
      const cnt = container(syncConfig);

      const instance = cnt.use(myClassTransient);

      expectType<MyClass>(instance);
    });

    it(`protects from using invalid scopes`, async () => {
      configureContainer(c => {
        // @ts-expect-error - singleton doesn't accept scoped dependencies
        c.add(myClassSingleton).class(MyClass, numDefScoped, strDefScoped);
      });
    });
  });

  describe(`resolution2`, () => {
    describe(`sync resolution`, () => {
      it(`doesn't lift to async if all dependencies are sync`, async () => {
        const cnt = container(syncConfig);

        const instance = cnt.use(myClassTransient);

        expect(instance).toBeInstanceOf(MyClass);

        const awaited = cnt.use(myClassTransient);

        expect(awaited.num.value).toBe(123);
        expect(awaited.str.value).toBe('123');
      });

      it(`throws when definition symbol is not registered`, async () => {
        const cnt = container();

        await expect(() => {
          cnt.use(myClassTransient);
        }).toThrow('Cannot find definition for Symbol(MyClassTransient)');
      });
    });

    describe(`async resolution`, () => {
      it(`lifts to Promise if some of dependencies are async`, async () => {
        const cnt = container(asyncConfig);

        const awaited = await cnt.use(myClassTransientAsync);

        expect(awaited.num.value).toBe(123);
        expect(awaited.str.value).toBe('123');
      });
    });
  });

  describe(`scopes2`, () => {
    describe(`singleton`, () => {
      it(`returns always the same instance`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassSingleton);
        const instance2 = cnt.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });

      it(`returns the same instance also fetched from the child scope`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassSingleton);
        const childScope = cnt.scope();

        const instance2 = childScope.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });

      it(`propagates singleton to the root container`, async () => {
        const cnt = container(syncConfig);

        const childScope = cnt.scope();

        const instance2 = childScope.use(myClassSingleton);
        const instance1 = cnt.use(myClassSingleton);

        expect(instance1).toBe(instance2);
      });
    });

    describe(`transient`, () => {
      it(`returns always a new instance`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassTransient);
        const instance2 = cnt.use(myClassTransient);

        expect(instance1).not.toBe(instance2);
      });
    });

    describe(`scoped`, () => {
      it(`returns the same instance within a scope`, async () => {
        const cnt = container(syncConfig);

        const instance1 = cnt.use(myClassScoped);
        const instance2 = cnt.use(myClassScoped);

        expect(instance1).toBe(instance2);

        const childScope = cnt.scope();

        const scopeInstance1 = childScope.use(myClassScoped);
        const scopeInstance2 = childScope.use(myClassScoped);

        expect(scopeInstance1).toBe(scopeInstance2);

        expect(instance1).not.toBe(scopeInstance1);
        expect(instance2).not.toBe(scopeInstance2);
      });
    });

    describe(`cascading`, () => {
      const config = configureContainer(c => {
        c.add(numDefCascading).fn(() => new BoxedValue(123));
        c.add(strDefCascading).fn(() => new BoxedValue('123'));
        c.add(myClassCascading).using(numDefCascading, strDefCascading).class(MyClass);
      });

      it(`is inherited by child scope`, async () => {
        const cnt = container(config);

        const childScope = cnt.scope();

        const instance1 = cnt.use(myClassCascading);
        const instance2 = childScope.use(myClassCascading);

        expect(instance1).toBe(instance2);
      });

      it(`is inherited until a child scope makes owning the definition`, async () => {
        const root = container(config);

        const scopeL1 = root.scope(s => s.modify(numDefCascading).claimNew());
        const scopeL2 = scopeL1.scope(s => s.modify(myClassCascading).claimNew());
        const scopeL3 = scopeL2.scope();

        expect(root.use(numDefCascading)).toBe(root.use(numDefCascading));

        // L1 owns numDefCascading
        expect(root.use(numDefCascading)).not.toBe(scopeL1.use(numDefCascading));
        expect(scopeL1.use(numDefCascading)).toBe(scopeL2.use(numDefCascading));
        expect(scopeL2.use(numDefCascading)).toBe(scopeL3.use(numDefCascading));

        // only root owns strDefCascading
        expect(root.use(strDefCascading)).toBe(scopeL1.use(strDefCascading));
        expect(scopeL1.use(strDefCascading)).toBe(scopeL2.use(strDefCascading));
        expect(scopeL2.use(strDefCascading)).toBe(scopeL3.use(strDefCascading));

        expect(root.use(myClassCascading)).toBe(scopeL1.use(myClassCascading));
        expect(scopeL1.use(myClassCascading)).not.toBe(scopeL2.use(myClassCascading));
        expect(scopeL2.use(myClassCascading)).toBe(scopeL3.use(myClassCascading));
      });
    });
  });
});
