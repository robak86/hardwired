import { Bench } from 'tinybench';

import { maybePromiseThen } from '../utils/async.js';

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
  });

void instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
