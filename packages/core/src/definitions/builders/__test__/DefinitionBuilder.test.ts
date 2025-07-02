import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe } from 'vitest';

import type { IDefinitionBuilder } from '../DefinitionBuilder.js';
import { DefinitionBuilder } from '../DefinitionBuilder.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import type { IDefinitionToken } from '../../DefinitionToken.js';
import { singleton } from '../../tokens.js';
import { value } from '../../value.js';
import type { Definition } from '../../impl/Definition.js';
import type { ArgumentPlaceholderToken } from '../ArgumentPlaceholderToken.js';
import { container } from '../../../container/Container.js';
import type { IDefinition } from '../../abstract/IDefinition.js';

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
        describe(`sync deps`, () => {
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

        describe(`async deps`, () => {
          it(`is called with correct arguments`, async () => {
            const num = singleton.fn(async () => 1);
            const bool = singleton.fn(async () => true);

            const def = singleton
              .using(num)
              .using(bool)
              .fn((n, b) => {
                expectType<number>(n);
                expectType<boolean>(b);

                return `${n} - ${b}`;
              });

            expectType<IDefinitionToken<Promise<string>, LifeTime.singleton>>(def);
          });
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

    describe('class', () => {
      describe(`no constructor args`, () => {
        it(`has correct types`, async () => {
          class MyClass {}

          const def = singleton.class(MyClass);

          type Expected = IDefinition<MyClass, LifeTime.singleton>;

          expectType<TypeEqual<typeof def, Expected>>(true);
        });
      });

      describe(`with deferred arg`, () => {
        it(`uses correct types`, async () => {
          class MyClass {
            constructor(_str: string) {}
          }

          const def = singleton.arg<string>().class(MyClass);

          type Expected = IDefinition<(arg: string) => MyClass, LifeTime.singleton>;

          expectType<TypeEqual<typeof def, Expected>>(true);
        });
      });

      describe(`with deps and args mixed`, () => {
        it(`uses correct types`, async () => {
          class MyClass {
            constructor(_num: number, _str: string) {}
          }

          const num = value(1);
          const def = singleton.using(num).arg<string>().class(MyClass);

          type Expected = IDefinition<(arg: string) => MyClass, LifeTime.singleton>;

          expectType<TypeEqual<typeof def, Expected>>(true);
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

        describe(`arguments mixed with async dependencies`, () => {
          describe(`async dependencies`, () => {
            it(`synchronously returns a factory function`, async () => {
              const num = singleton.fn(async () => 1);
              const bool = singleton.fn(async () => true);

              const def = singleton
                .using(num)
                .arg<string>()
                .using(bool)
                .fn((n, str, b) => `${n} - ${str} - ${b}`);

              const val = container().use(def);

              expect(val).toBeInstanceOf(Function);
              expect(await val('test')).toBe('1 - test - true');
            });
          });

          describe(`sync dependencies`, () => {
            it(`synchronously returns a factory function`, async () => {
              const num = singleton.fn(() => 1);
              const bool = singleton.fn(() => true);

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

        describe(`overrides`, () => {
          describe(`decorate`, () => {
            it(`returns decorated value`, async () => {
              const str = value('dep');

              const def = singleton
                .using(str)
                .arg<string>()
                .fn((n, b) => `${n} - ${b}`);

              const val = container(c => {
                c.modify(def).decorate(factory => {
                  return str => `${factory(`${str} - decorated_arg`)} - decorated_result`;
                });
              }).use(def);

              expect(val('param')).toBe('dep - param - decorated_arg - decorated_result');
            });
          });
        });
      });
    });

    describe(`class`, () => {
      describe(`with arguments`, () => {
        it(`returns correct instance`, async () => {
          class MyClass {
            constructor(
              private _num: number,
              private _str: string,
            ) {}

            get value() {
              return `${this._num} - ${this._str}`;
            }
          }

          const num = value(1);
          const def = singleton.using(num).arg<string>().class(MyClass);

          const instance = container().use(def);

          expect(instance).toBeInstanceOf(Function);
          expect(instance('test').value).toBe('1 - test');
        });
      });

      describe(`just arguments`, () => {
        it(`returns correct value`, async () => {
          class MyClass {
            constructor(private _str: string) {}

            get value() {
              return this._str;
            }
          }

          const def = singleton.arg<string>().class(MyClass);

          const instance = container().use(def);

          expect(instance).toBeInstanceOf(Function);
          expect(instance('test').value).toBe('test');
        });
      });
    });
  });
});
