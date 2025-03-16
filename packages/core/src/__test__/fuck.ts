import { fn } from '../definitions/fn.js';
import { once } from '../container/Container.js';

const def = fn.singleton(() => ({
  value: Math.random(),
  [Symbol.dispose]: () => {
    console.log('dispose');
  },
}));

// let items: any[] = [];

function main() {
  for (let i = 0; i < 1000; i++) {
    using result = once(def);
    console.log(result.value);
  }
}

main();

setTimeout(() => {
  console.log('done');

  // items = [];
  //
  // Bun.gc();

  setTimeout(() => {
    console.log('done dene');
  }, 1000);
}, 2000);
