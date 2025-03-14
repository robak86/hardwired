import { ScopesRegistry } from '../ScopesRegistry.js';

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

describe(`ScopesRegistry`, () => {
  it(`calls disposables when object is garbage collected`, async () => {
    const disposer = new ScopesRegistry();

    const disposable: Disposable = {
      [Symbol.dispose]: vi.fn(),
    };

    const run = () => {
      const container = {
        id: crypto.randomUUID(),
      };

      disposer.registerScope(container, [disposable]);
    };

    run();

    await runGC();

    await vi.waitFor(() => {
      expect(disposable[Symbol.dispose]).toHaveBeenCalled();
    });
  });
});
