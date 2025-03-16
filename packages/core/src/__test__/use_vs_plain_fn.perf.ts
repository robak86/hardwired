import { Bench } from 'tinybench';

import { container } from '../container/Container.js';
import type { IContainer } from '../container/IContainer.js';
import { fn } from '../definitions/fn.js';
import { unbound } from '../definitions/unbound.js';

type Ctx = { value: number };

const f1 = (ctx: Ctx) => f2(ctx);
const f2 = (ctx: Ctx) => f3(ctx);
const f3 = (ctx: Ctx) => f4(ctx);
const f4 = (ctx: Ctx) => f5(ctx);
const f5 = (ctx: Ctx) => f6(ctx);
const f6 = (ctx: Ctx) => f7(ctx);
const f7 = (ctx: Ctx) => f8(ctx);
const f8 = (ctx: Ctx) => f9(ctx);
const f9 = (ctx: Ctx) => ctx.value;

let cnt: IContainer;

const ctx = unbound<Ctx>();

const d1 = fn(use => use(d2));
const d2 = fn(use => use(d3));
const d3 = fn(use => use(d4));
const d4 = fn(use => use(d5));
const d5 = fn(use => use(d6));
const d6 = fn(use => use(d7));
const d7 = fn(use => use(d8));
const d8 = fn(use => use(d9));
const d9 = fn(use => use(ctx).value);

const instantiationBench = new Bench({
  time: 100,
  setup: () => {
    cnt = container.new(scope => scope.bindCascading(ctx).to(fn.scoped(() => ({ value: Math.random() }))));
  },
  teardown: () => {
    cnt = container.new();
  },
});

instantiationBench
  .add('plainFn', () => {
    f1({ value: Math.random() });
  })
  .add('transientD', () => {
    cnt.use(d1);
  });

await instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
