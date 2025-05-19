import { unbound } from '../unbound.js';
import { cls } from '../cls.js';
import { value } from '../value.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import { configureScope } from '../../configuration/ScopeConfiguration.js';
import { container } from '../../container/Container.js';
import { fn } from '../fn.js';

describe(`unbound`, () => {
  describe(`scopes`, () => {
    describe(`overrideCascading`, () => {
      describe(`binding to value`, () => {
        it(`acts as scoped`, async () => {
          const unboundDefinition = unbound.scoped<string>();

          const configure = configureContainer(c => {
            c.overrideCascading(unboundDefinition).toRedefined(() => crypto.randomUUID());
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
            const unboundDefinition = unbound.singleton<string>();
            const singletonNumber = fn.singleton(() => crypto.randomUUID());

            const configure = configureContainer(c => {
              c.bind(unboundDefinition).to(singletonNumber);
            });

            const cnt = container.new(configure);

            const result = cnt.use(unboundDefinition);
            const scopeResult = cnt.scope().use(unboundDefinition);

            expect(result).toBe(scopeResult);
          });
        });

        describe(`scoped`, () => {
          it(`acts as scoped`, async () => {
            const unboundDefinition = unbound.scoped<string>();
            const singletonNumber = fn.scoped(() => crypto.randomUUID());

            const configure = configureContainer(c => {
              c.overrideCascading(unboundDefinition).to(singletonNumber);
            });

            const cnt = container.new(configure);

            const result = cnt.use(unboundDefinition);
            const scopeResult = cnt.scope().use(unboundDefinition);

            expect(result).toBe(scopeResult);
          });
        });
      });
    });

    describe(`bind`, () => {
      it(`acts as scoped`, async () => {
        const unboundDefinition = unbound.scoped<string>();

        const configure = configureContainer(c => {
          // bind only for the current scope
          c.bind(unboundDefinition).toRedefined(() => crypto.randomUUID());
        });

        const cnt = container.new(configure);

        const result = cnt.use(unboundDefinition);
        const sameScopeResult = cnt.use(unboundDefinition);

        expect(result).toBe(sameScopeResult);

        cnt.scope().use(unboundDefinition);
      });

      it(`keeps override for the child scope`, async () => {
        const def = fn.scoped(() => 1);

        const redefinedSpy = vi.fn(() => 2);

        const cnt = container.new(c => c.bind(def).toRedefined(redefinedSpy));
        const cntResult = cnt.use(def);

        const scope = cnt.scope();
        const scopeDef = scope.use(def);

        expect(redefinedSpy).toHaveBeenCalledTimes(2);
        expect(cntResult).toBe(2);
        expect(scopeDef).toBe(2);
      });
    });
  });

  describe(`injecting implementation for an interface`, () => {
    const IMyInterfaceSingleton = unbound.singleton<IMyInterface>();
    const IMyInterfaceScoped = unbound.scoped<IMyInterface>();
    const IMyInterfaceTransient = unbound.transient<IMyInterface>();

    interface IMyInterface {
      multiply(a: number, b: number): number;
    }

    const scalingFactor = value(10);

    class MyClass implements IMyInterface {
      static scopedInstance = cls.scoped(this, [scalingFactor]);
      static transientInstance = cls.transient(this, [scalingFactor]);
      static singletonInstance = cls.singleton(this, [scalingFactor]);

      constructor(private _scalingFactor: number) {}

      multiply(a: number, b: number) {
        return a * b * this._scalingFactor;
      }
    }

    it(`provides implementation for the interface`, async () => {
      const configure = configureContainer(c => {
        c.overrideCascading(IMyInterfaceSingleton).to(MyClass.singletonInstance);
      });

      const cnt = container.new(configure);

      const result = cnt.use(IMyInterfaceSingleton);

      expect(result).toBeInstanceOf(MyClass);
    });

    it(`prevents assigning singleton definitions in `, async () => {
      configureScope(c => {
        c.overrideCascading(IMyInterfaceScoped).to(MyClass.scopedInstance);
        c.overrideCascading(IMyInterfaceTransient).to(MyClass.transientInstance);

        // @ts-expect-error - cannot bind singletons in scope configuration
        c.overrideCascading(IMyInterfaceSingleton).to(MyClass.singletonInstance);
      });
    });
  });
});
