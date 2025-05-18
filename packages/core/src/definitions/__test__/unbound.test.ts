import { unbound } from '../unbound.js';
import { cls } from '../cls.js';
import { value } from '../value.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import { configureScope } from '../../configuration/ScopeConfiguration.js';
import { container } from '../../container/Container.js';
import { fn } from '../fn.js';

describe(`unbound`, () => {
  describe(`scopes`, () => {
    describe(`bindCascading`, () => {
      describe(`binding to value`, () => {
        it(`acts as scoped`, async () => {
          const unboundDefinition = unbound<string>();

          const configure = configureContainer(c => {
            c.bindCascading(unboundDefinition).toRedefined(() => crypto.randomUUID());
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
            const unboundDefinition = unbound<string>();
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
            const unboundDefinition = unbound<string>();
            const singletonNumber = fn.scoped(() => crypto.randomUUID());

            const configure = configureContainer(c => {
              c.bindCascading(unboundDefinition).to(singletonNumber);
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
        const unboundDefinition = unbound<string>();

        const configure = configureContainer(c => {
          // bind only for the current scope
          c.bind(unboundDefinition).toRedefined(() => crypto.randomUUID());
        });

        const cnt = container.new(configure);

        const result = cnt.use(unboundDefinition);
        const sameScopeResult = cnt.use(unboundDefinition);

        expect(result).toBe(sameScopeResult);

        // it's not cascading to the child scope, so the error is thrown
        expect(() => cnt.scope().use(unboundDefinition)).toThrowError(`Cannot instantiate unbound definition`);
      });
    });
  });

  describe(`injecting implementation for an interface`, () => {
    const IMyInterface = unbound<IMyInterface>();

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
        c.bindCascading(IMyInterface).to(MyClass.singletonInstance);
      });

      const cnt = container.new(configure);

      const result = cnt.use(IMyInterface);

      expect(result).toBeInstanceOf(MyClass);
    });

    it(`prevents assigning singleton definitions in `, async () => {
      configureScope(c => {
        c.bindCascading(IMyInterface).to(MyClass.scopedInstance);
        c.bindCascading(IMyInterface).to(MyClass.transientInstance);

        // @ts-expect-error - cannot bind singletons in scope configuration
        c.bindCascading(IMyInterface).to(MyClass.singletonInstance);
      });
    });
  });
});
