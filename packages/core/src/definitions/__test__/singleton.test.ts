import { BoxedValue } from '../../__test__/BoxedValue.js';
import { container } from '../../container/Container.js';
import { singleton } from '../tokens.js';

describe(`singleton`, () => {
  describe(`container configuration`, () => {
    describe(`configure`, () => {
      describe(`no additional dependencies`, () => {
        it(`calls configure callback`, async () => {
          const def = singleton.fn(() => new BoxedValue(0));

          const cnt = container(c => {
            c.modify(def).configure(boxedValue => {
              boxedValue.value = 123;
            });
          });

          expect(cnt.use(def)).toEqual(new BoxedValue(123));
        });

        it(`calls configure callback when definition is others definition dependency`, async () => {
          const def = singleton.fn(() => new BoxedValue(0));
          const consumer = singleton.using(def).fn((boxedValue: BoxedValue<number>) => {
            return { boxedValue };
          });

          const cnt = container(c => {
            c.modify(def).configure(boxedValue => {
              boxedValue.value = 123;
            });
          });

          expect(cnt.use(consumer).boxedValue).toEqual(new BoxedValue(123));
        });

        it(`calls configure callback when definition is dispatched from a child scope`, async () => {
          const def = singleton.fn(() => new BoxedValue(0));
          const consumer = singleton.using(def).fn((boxedValue: BoxedValue<number>) => {
            return { boxedValue };
          });

          const cnt = container(c => {
            c.modify(def).configure(boxedValue => {
              boxedValue.value = 123;
            });
          });

          const scope = cnt.scope();

          const val = scope.use(consumer);

          expect(val.boxedValue).toEqual(new BoxedValue(123));
        });
      });

      describe(`additional dependencies`, () => {
        it(`calls configure callback with additional deps`, async () => {
          const def = singleton.fn(() => new BoxedValue(''));
          const dep1 = singleton.token<BoxedValue<string>>();
          const dep2 = singleton.token<BoxedValue<string>>();

          const cnt = container(
            c => {
              c.add(dep1).fn(() => new BoxedValue('dep1'));
              c.add(dep2).fn(() => new BoxedValue('dep2'));
            },
            c => {
              c.modify(def)
                .using(dep1)
                .using(dep2)
                .configure((boxedValue, dep1, dep2) => {
                  boxedValue.value = dep1.value + dep2.value;
                });
            },
            c => {
              c.modify(def).configure(boxedValue => {
                boxedValue.value += 'dep3';
              });
            },
          );

          expect(cnt.use(def)).toEqual(new BoxedValue('dep1dep2dep3'));
        });
      });
    });
  });
});
