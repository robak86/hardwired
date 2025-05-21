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
        configureScope(s => {
          s.add(someScoped);
          s.add(someTransient);
          s.add(someCascading);

          // @ts-expect-error cannot add singletons
          s.add(someSingleton);
        });
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

        expect(scopeL1.use(someScoped)).toMatchObject({ value: 123 });
        expect(scopeL1.use(someTransient)).toMatchObject({ value: 456 });
        expect(scopeL1.use(someCascading)).toMatchObject({ value: 789 });

        expect(scopeL2.use(someScoped)).toMatchObject({ value: 123 });
        expect(scopeL2.use(someTransient)).toMatchObject({ value: 456 });
        expect(scopeL2.use(someCascading)).toMatchObject({ value: 789 });

        expect(scopeL1.use(someScoped)).not.toBe(scopeL2.use(someScoped));
        expect(scopeL1.use(someTransient)).not.toBe(scopeL2.use(someTransient));

        expect(scopeL1.use(someCascading)).toBe(scopeL2.use(someCascading));

        expect(() => cnt.use(someScoped)).toThrowError('Cannot find definition');
        expect(() => cnt.use(someCascading)).toThrowError('Cannot find definition');
        expect(() => cnt.use(someSingleton)).toThrowError('Cannot find definition');
        expect(() => cnt.use(someTransient)).toThrowError('Cannot find definition');
      });
    });
  });
});
