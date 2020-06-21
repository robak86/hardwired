import { compilePathDefinition } from '../compilePathDefinition';

describe('compilePathDefinition', () => {
  afterEach(compilePathDefinition.clearCache);

  it('caches compiled objects', () => {
    const a = compilePathDefinition('a');
    const b = compilePathDefinition('a');
    expect(a).toBe(b);
  });
});
