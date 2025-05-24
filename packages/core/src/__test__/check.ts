import { Bench } from 'tinybench';

import { maybePromiseAllThen, maybePromiseThen } from '../utils/async.js';
import { MaybeAsync } from '../utils/MaybeAsync.js';

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
  return MaybeAsync.resolve(Math.random());
}

function bMaybePromise() {
  return MaybeAsync.resolve(Math.random());
}

function cMaybePromise() {
  return MaybeAsync.all([aMaybePromise(), bMaybePromise()]).then(([a, b]) => a * b);
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
