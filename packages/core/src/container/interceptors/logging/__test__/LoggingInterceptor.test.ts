import { container } from '../../../Container.js';
import { LoggingInterceptor } from '../LoggingInterceptor.js';
import { fn } from '../../../../definitions/definitions.js';
import { cls } from '../../../../definitions/cls.js';

describe(`LoggingInterceptor`, () => {
  describe(`sync`, () => {
    it(`it prints correct messages`, async () => {
      const logger = LoggingInterceptor.create();
      const cnt = container.new(c => c.withInterceptor('logging', logger));

      const a1 = fn.singleton(() => 'A1');
      const a2 = fn.singleton(() => 'A2');

      const b = fn.scoped(use => {
        return { a1: use(a1), a2: use(a2) };
      });
      const c = fn.scoped(use => {
        return { c: use(b), a1: use(a1) };
      });

      cnt.use(c);
      cnt.use(c);

      cnt.withScope(use => {
        use(c);
      });
    });

    it(`it prints correct messages for classes`, async () => {
      const logger = LoggingInterceptor.create();
      const cnt = container.new(c => c.withInterceptor('logging', logger));

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

      const a1 = cls.singleton(A1);
      const a2 = cls.singleton(A2);

      const b = cls.scoped(B, [a1, a2]);

      const c = cls.scoped(C, [b, a1]);

      cnt.use(c);
    });
  });

  describe(`async`, () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    it(`it prints correct messages`, async () => {
      const logger = LoggingInterceptor.create();
      const cnt = container.new(c => c.withInterceptor('logging', logger));

      const a = fn.singleton(async () => {
        await sleep(50);
        return 'A';
      });

      const b = fn.singleton(async use => {
        await sleep(200);
        return { b: await use(a) };
      });

      const c = fn.singleton(async use => {
        await sleep(100);
        return { c: await use(b) };
      });

      await cnt.use(c);
    });
  });
});
