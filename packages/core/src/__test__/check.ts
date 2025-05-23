import { Bench } from 'tinybench';

import { maybePromiseAllThen, maybePromiseThen } from '../utils/async.js';
import { MaybePromise } from '../utils/MaybePromise.js';

function a() {
  return Math.random();
}

function b() {
  return Math.random();
}

function c() {
  return a() * b();
}

async function aAsync() {
  return Math.random();
}

async function bAsync() {
  return Math.random();
}

async function cAsync() {
  return (await aAsync()) * (await bAsync());
}

function aMaybePromise() {
  return new MaybePromise(Math.random());
}

function bMaybePromise() {
  return new MaybePromise(Math.random());
}

function cMaybePromise() {
  return MaybePromise.all([aMaybePromise(), bMaybePromise()]).then(([a, b]) => a * b);
}

// cMaybePromise().trySync();

const instantiationBench = new Bench({
  time: 200,
  setup: () => {},
  teardown: () => {},
})
  .add('c', () => {
    c();
  })
  .add('fn async awaited ', async () => {
    await c();
  })
  .add('cAsync', async () => {
    await cAsync();
  })

  .add('maybePromise', () => {
    return maybePromiseThen(a(), a => {
      return maybePromiseThen(b(), b => {
        return a * b;
      });
    });
  })
  .add('maybePromiseAllThen', () => {
    return maybePromiseAllThen([a(), b()], ([a, b]) => {
      return a * b;
    });
  })

  .add('monadic maybePromise trySync', () => {
    cMaybePromise().trySync();
  })

  .add('monadic maybePromise awaited', async () => {
    await cMaybePromise();
  });

void instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
