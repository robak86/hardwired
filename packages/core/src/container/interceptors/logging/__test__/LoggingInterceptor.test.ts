import { singleton } from '../../../../definitions/def-symbol.js';
import { container } from '../../../Container.js';
import { LoggingInterceptor } from '../LoggingInterceptor.js';

describe.skip(`LoggingInterceptor`, () => {
  describe(`sync`, () => {
    it(`it prints correct messages`, async () => {
      const logger = LoggingInterceptor.create();

      const a1 = singleton<string>('a1');
      const a2 = singleton<string>('a2');

      const b = singleton<{ a1: string; a2: string }>('b');
      const c = singleton<{ b: { a1: string; a2: string }; a1: string }>('c');

      const cnt = container.new(configure => {
        configure.add(a1).fn(() => 'A1');
        configure.add(a2).fn(() => 'A2');
        configure.add(b).fn((a1, a2) => ({ a1, a2 }), a1, a2);
        configure.add(c).fn((b, a1) => ({ b, a1 }), b, a1);

        configure.withInterceptor('logging', logger);
      });

      await cnt.use(c);
      await cnt.use(c);

      await cnt.scope().use(c);
    });

    it(`it prints correct messages for classes`, async () => {
      const logger = LoggingInterceptor.create();

      class A1 {}
      class A2 {}
      class B {
        constructor(
          private _a1: A1,
          private _a2: A2,
        ) {}

        get a1() {
          return this._a1;
        }

        get a2() {
          return this._a2;
        }
      }

      class C {
        constructor(
          private _b: B,
          private _a1: A1,
        ) {}

        get b() {
          return this._b;
        }

        get a1() {
          return this._a1;
        }
      }

      const a1 = singleton<A1>('A1');
      const a2 = singleton<A2>('A2');
      const b = singleton<B>('B');
      const cDef = singleton<C>('C');

      const cnt = container.new(c => {
        c.add(a1).class(A1);
        c.add(a2).class(A2);
        c.add(b).class(B, a1, a2);
        c.add(cDef).class(C, b, a1);

        c.withInterceptor('logging', logger);
      });

      await cnt.use(cDef);
    });
  });

  describe(`async`, () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    it(`it prints correct messages`, async () => {
      const logger = LoggingInterceptor.create();

      const aDef = singleton<string>('aDef');
      const bDef = singleton<{ a: string }>('bDef');
      const cDef = singleton<{ b: { a: string } }>('cDef');

      const cnt = container.new(c => {
        c.add(aDef).fn(async () => {
          await sleep(50);

          return 'A';
        });

        c.add(bDef).fn(async aDefVal => {
          await sleep(200);

          return { a: aDefVal };
        }, aDef);

        c.add(cDef).fn(async bDefVal => {
          await sleep(100);

          return { b: bDefVal };
        }, bDef);

        c.withInterceptor('logging', logger);
      });

      await cnt.use(cDef);
    });
  });
});
