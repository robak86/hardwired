export let result: string[] = [];

for (let i = 0; i < 1000; i++) {
  const current = `const consumer${i + 1} = singleton.class(Consumer, a1, val, consumer${i})`;
  result.push(current);
}

console.log(result.join('\n'));
