import { configureScope } from '../ScopeConfiguration.js';
import { cascading, scoped, singleton, transient } from '../../definitions/def-symbol.js';
import { container } from '../../container/Container.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';

describe(`ScopeConfiguration`, () => {
  const someSingleton = singleton<BoxedValue<number>>();
  const someScoped = scoped<BoxedValue<number>>();
  const someCascading = cascading<BoxedValue<number>>();
  const someTransient = transient<BoxedValue<number>>();

  describe(`add`, () => {
    describe(`types`, () => {
      it(`doesn't allow registering singletons`, async () => {
        const buildConfiguration = () =>
          configureScope(s => {
            s.add(someScoped);
            s.add(someTransient);
            s.add(someCascading);

            // @ts-expect-error cannot add singletons
            s.add(someSingleton);
          });

        expect(buildConfiguration).toThrowError(
          'Invalid life time "singleton" for Symbol(). Allowed: scoped, transient, cascading',
        );
      });
    });

    describe(`registration`, () => {
      it(`registers definition only for the current scope and all the child scopes`, async () => {
        const cnt = container.new();

        const scopeL1 = cnt.scope(s => {
          s.add(someScoped).fn(() => new BoxedValue(123));
          s.add(someTransient).fn(() => new BoxedValue(456));
          s.add(someCascading).fn(() => new BoxedValue(789));
        });
        const scopeL2 = scopeL1.scope();

        expect(scopeL1.use(someScoped).trySync()).toMatchObject({ value: 123 });
        expect(scopeL1.use(someTransient).trySync()).toMatchObject({ value: 456 });
        expect(scopeL1.use(someCascading).trySync()).toMatchObject({ value: 789 });

        expect(scopeL2.use(someScoped).trySync()).toMatchObject({ value: 123 });
        expect(scopeL2.use(someTransient).trySync()).toMatchObject({ value: 456 });
        expect(scopeL2.use(someCascading).trySync()).toMatchObject({ value: 789 });

        expect(scopeL1.use(someScoped).trySync()).not.toBe(scopeL2.use(someScoped).trySync());
        expect(scopeL1.use(someTransient).trySync()).not.toBe(scopeL2.use(someTransient).trySync());

        expect(scopeL1.use(someCascading).trySync()).toBe(scopeL2.use(someCascading).trySync());

        expect(() => cnt.use(someScoped)).toThrowError('Cannot find definition');
        expect(() => cnt.use(someCascading)).toThrowError('Cannot find definition');
        expect(() => cnt.use(someSingleton)).toThrowError('Cannot find definition');
        expect(() => cnt.use(someTransient)).toThrowError('Cannot find definition');
      });
    });
  });
});
