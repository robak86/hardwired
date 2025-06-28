import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';

import type { IDefinitionBuilder } from '../DefinitionBuilder.js';
import { DefinitionBuilder } from '../DefinitionBuilder.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import type { IDefinitionToken } from '../../DefinitionToken.js';
import { singleton } from '../../tokens.js';
import { value } from '../../value.js';
import type { Definition } from '../../impl/Definition.js';
import type { ArgumentPlaceholderToken } from '../ArgumentPlaceholderToken.js';
import { container } from '../../../container/Container.js';

describe(`DefinitionBuilder`, () => {
  describe(`types`, () => {
    describe(`tokens`, () => {
      it(`returns correct token`, () => {
        const builder = new DefinitionBuilder(LifeTime.singleton, []);

        expectType<IDefinitionToken<number, LifeTime.singleton>>(builder.token<number>());
      });
    });

    describe(`collecting dependencies`, () => {
      it(`returns correct type`, () => {
        const num = value(1);
        const str = value('str');
        const bool = value(true);

        const def = singleton.using(num, str).using(bool);

        type Expected = IDefinitionBuilder<
          LifeTime.singleton,
          [
            Definition<number, LifeTime.singleton>,
            Definition<string, LifeTime.singleton>,
            Definition<boolean, LifeTime.singleton>,
          ]
        >;

        expectType<TypeEqual<typeof def, Expected>>(true);
      });
    });

    describe(`collecting dependencies with arguments`, () => {
      it(`returns correct type`, () => {
        const num = value(1);

        const bool = value(true);

        const def = singleton.using(num).arg<string>().using(bool);

        type Expected = IDefinitionBuilder<
          LifeTime.singleton,
          [
            Definition<number, LifeTime.singleton>,
            ArgumentPlaceholderToken<string, LifeTime.singleton>,
            Definition<boolean, LifeTime.singleton>,
          ]
        >;

        expectType<TypeEqual<typeof def, Expected>>(true);
      });
    });

    describe(`fn`, () => {
      describe(`no arguments`, () => {
        it(`is called with correct arguments`, async () => {
          const num = value(1);
          const bool = value(true);

          const def = singleton
            .using(num)
            .using(bool)
            .fn((n, b) => {
              expectType<number>(n);
              expectType<boolean>(b);

              return `${n} - ${b}`;
            });

          expectType<IDefinitionToken<string, LifeTime.singleton>>(def);
        });
      });

      describe(`arguments`, () => {
        it(`includes arguments`, async () => {
          const num = value(1);
          const bool = value(true);

          const def = singleton
            .using(num)
            .arg<string>()
            .using(bool)
            .fn((n, str, b) => {
              expectType<number>(n);
              expectType<string>(str);
              expectType<boolean>(b);

              return `${n} - ${str} - ${b}`;
            });

          expectType<IDefinitionToken<(str: string) => string, LifeTime.singleton>>(def);
        });
      });
    });
  });

  describe(`runtime`, () => {
    describe(`fn`, () => {
      describe(`no arguments`, () => {
        it(`returns correct value`, async () => {
          const num = value(1);
          const bool = value(true);

          const def = singleton
            .using(num)

            .using(bool)
            .fn((n, b) => `${n} - ${b}`);

          const val = container().use(def);

          expect(val).toEqual('1 - true');
        });
      });

      describe(`with arguments`, () => {
        describe(`just a single argument`, () => {
          it(`returns correct value via thunk`, async () => {
            const def = singleton.arg<string>().fn(arg => arg);
            const val = container().use(def);

            expect(val).toBeInstanceOf(Function);
            expect(val('test')).toBe('test');
          });
        });

        describe(`arguments mixed with other dependencies`, () => {
          it(`returns correct instance via thunk`, async () => {
            const num = value(1);
            const bool = value(true);

            const def = singleton
              .using(num)
              .arg<string>()
              .using(bool)
              .fn((n, str, b) => `${n} - ${str} - ${b}`);

            const val = container().use(def);

            expect(val).toBeInstanceOf(Function);
            expect(val('test')).toBe('1 - test - true');
          });
        });
      });
    });
  });
});
