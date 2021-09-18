import { Container } from '../../container/Container';
import { useContainer } from '../useContainer';
import { withContainer } from '../withContainer';

describe(`useContainer`, () => {
  it(`throws an error if container is not present in current context`, async () => {
    expect(useContainer).toThrowError('');
  });

  it(`returns current container`, async () => {
    const currentContainer = withContainer(() => useContainer());
    expect(currentContainer).toBeInstanceOf(Container);
  });
});

/*

withContainer(() => {
  provide(moduleA, 'key', newValue)

  useDefinition(moduleA, 'key') // returns new Value

})

 */
