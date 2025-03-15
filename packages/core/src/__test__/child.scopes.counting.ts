import { container } from '../container/Container.js';

function main() {
  const cnt = container.new();

  for (let i = 0; i < 1_000; i++) {
    cnt.scope().scope().scope();
    console.log(cnt.activeScopes);
  }

  console.log(cnt.activeScopes);

  Bun.gc();

  setTimeout(() => {
    console.log(cnt.activeScopes);
  }, 1000);
}

main();
