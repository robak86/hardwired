import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import { container } from '../../container/Container.js';
import { cascading, scoped, singleton, transient } from '../def-symbol.js';

describe(`unbound`, () => {
  describe(`scopes`, () => {
    describe(`overrideCascading`, () => {
      describe(`binding to value`, () => {
        it(`acts as scoped`, async () => {
          const unboundDefinition = cascading<string>();

          const configure = configureContainer(c => {
            c.add(unboundDefinition).fn(() => crypto.randomUUID());
          });

          const cnt = container.new(configure);

          const result = cnt.use(unboundDefinition);
          const scopeResult = cnt.scope().use(unboundDefinition);

          expect(result).toBe(scopeResult);
        });
      });

      describe(`binding to definition`, () => {
        describe(`singleton`, () => {
          it(`acts as singleton`, async () => {
            const unboundDefinition = singleton<string>('unboundDefinition');

            const configure = configureContainer(c => {
              c.add(unboundDefinition).fn(() => crypto.randomUUID());
            });

            const cnt = container.new(configure);

            const result = cnt.use(unboundDefinition);
            const scopeResult = cnt.scope().use(unboundDefinition);

            expect(result).toBe(scopeResult);
          });
        });

        describe(`cascading`, () => {
          it(`acts as scoped`, async () => {
            const unboundDefinition = cascading<string>();

            const configure = configureContainer(c => {
              c.add(unboundDefinition).fn(() => crypto.randomUUID());
            });

            const cnt = container.new(configure);

            const result = cnt.use(unboundDefinition);
            const scopeResult = cnt.scope().use(unboundDefinition);

            expect(result).toBe(scopeResult);
          });
        });

        describe(`scoped`, () => {
          it(`acts as scoped`, async () => {
            const unboundDefinition = scoped<string>();

            const configure = configureContainer(c => {
              c.add(unboundDefinition).fn(() => crypto.randomUUID());
            });

            const cnt = container.new(configure);

            const result = cnt.use(unboundDefinition);
            const scopeResult = cnt.scope().use(unboundDefinition);

            expect(result).not.toBe(scopeResult);
          });
        });
      });
    });

    describe(`bind`, () => {
      it(`acts as scoped`, async () => {
        const unboundDefinition = scoped<string>();

        const configure = configureContainer(c => {
          // bind only for the current scope
          c.add(unboundDefinition).fn(() => crypto.randomUUID());
        });

        const cnt = container.new(configure);

        const result = cnt.use(unboundDefinition);
        const sameScopeResult = cnt.use(unboundDefinition);

        expect(result).toBe(sameScopeResult);

        cnt.scope().use(unboundDefinition);
      });

      it(`keeps override for the child scope`, async () => {
        const def = scoped<number>();

        const redefinedSpy = vi.fn(() => 2);

        const cnt = container.new(c => c.add(def).fn(redefinedSpy));
        const cntResult = cnt.use(def);

        const scope = cnt.scope();
        const scopeDef = scope.use(def);

        expect(redefinedSpy).toHaveBeenCalledTimes(2);
        expect(await cntResult).toBe(2);
        expect(await scopeDef).toBe(2);
      });
    });
  });

  describe(`injecting implementation for an interface`, () => {
    const IMyInterfaceSingleton = singleton<IMyInterface>();
    const IMyInterfaceScoped = scoped<IMyInterface>();
    const IMyInterfaceTransient = transient<IMyInterface>();

    interface IMyInterface {
      multiply(a: number, b: number): number;
    }

    const scalingFactor = singleton<number>();

    class MyClass implements IMyInterface {
      constructor(private _scalingFactor: number) {}

      multiply(a: number, b: number) {
        return a * b * this._scalingFactor;
      }
    }

    it(`provides implementation for the interface`, async () => {
      const configure = configureContainer(c => {
        c.add(scalingFactor).static(10);
        c.add(IMyInterfaceSingleton).class(MyClass, scalingFactor);
        c.add(IMyInterfaceScoped).class(MyClass, scalingFactor);
        c.add(IMyInterfaceTransient).class(MyClass, scalingFactor);
      });

      const cnt = container.new(configure);

      const result = cnt.use(IMyInterfaceSingleton);

      expect(await result).toBeInstanceOf(MyClass);
    });
  });
});
