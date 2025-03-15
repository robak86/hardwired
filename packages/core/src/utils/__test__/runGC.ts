export function runGC() {
  return new Promise<void>(resolve => {
    // Check if global.gc is available
    if (typeof global.gc !== 'function') {
      throw new Error('global.gc() is not available. Run Node.js with --expose-gc flag');
    }

    global.gc();

    setImmediate(resolve);
  });
}

const registry = new FinalizationRegistry((heldValue: string) => {
  console.log(`Object with label "${heldValue}" has been garbage collected!`);
});

export const trackObject = (obj: WeakKey, label: string) => {
  registry.register(obj, label);

  return obj;
};
