import { container } from '@hardwired/di-core';
import { unit } from '../module';

import * as b from 'benny';
import { tuple } from '@hardwired/di-core';

class DummyClass {
  private count = 0;
  constructor(private a, private b) {}

  call() {
    this.count += 1;
  }
}

const m = unit('a')
  .value('a', 1)
  .value('b', 2)
  .singleton('class', DummyClass, ctx => tuple(ctx.a, ctx.b))
  .singleton('class2', DummyClass, ctx => tuple(ctx.a, ctx.b))
  .singleton('hierarchy', DummyClass, ctx => tuple(ctx.class, ctx.class2));

const c = container(m);

for (let i = 0; i < 1000000; i++) {
  const a = c.get('hierarchy');
  a.call();
}

//
// b.suite(
//   'Example',
//
//   b.add('Fetch single value', () => {
//     const a = c.get('a');
//   }),
//
//   b.add('fetch singleton class', () => {
//     const a = c.get('class');
//   }),
//
//   b.add('Instantiate hierarchy', () => {
//     const a = c.get('hierarchy');
//   }),
//
//   b.add('Instantiate singleton manually', () => {
//     const a = new DummyClass(1, 2);
//   }),
//
//   b.cycle(),
//   b.complete(),
// );
