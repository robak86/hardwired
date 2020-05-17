import { DefinitionsSet } from '../..';
import { DependencyResolver } from '../../resolvers/DependencyResolver';
import { ContainerService } from '../ContainerService';

describe(`ContainerService`, () => {
  describe(`callDefinitionsListeners`, () => {
    let id = 0;
    const buildFakeResolver = (): DependencyResolver<any, any> => {
      return { id: id += 1, build: jest.fn(), onRegister: jest.fn() } as any;
    };

    const buildListeningResolver = () => {
      const onEvent = jest.fn();
      const resolver: DependencyResolver<any, any> = {
        id: id += 1,
        build: jest.fn(),
        onRegister(events) {
          events.onDefinitionAppend.add(onEvent);
        },
      } as any;

      return { resolver, onEvent };
    };

    describe(`module without imports`, () => {
      it(`calls all registered listeners from the bottom to the top`, async () => {
        const { resolver, onEvent } = buildListeningResolver();

        const d = DefinitionsSet.empty('d')
          .extendDeclarations('a', buildFakeResolver())
          .extendDeclarations('b', buildFakeResolver())
          .extendDeclarations('listening', resolver);

        ContainerService.callDefinitionsListeners(d);
        expect(onEvent.mock.calls[0][0]).toEqual(d.declarations.get('listening'));
        expect(onEvent.mock.calls[1][0]).toEqual(d.declarations.get('b'));
        expect(onEvent.mock.calls[2][0]).toEqual(d.declarations.get('a'));
      });
    });

    describe(`module with imports`, () => {
      it(`calls all registered listeners from the bottom to the top`, async () => {
        const topLevelListeningResolver = buildListeningResolver();
        const childListeningResolver = buildListeningResolver();

        const child = DefinitionsSet.empty('child')
          .extendDeclarations('childA', buildFakeResolver())
          .extendDeclarations('childB', buildFakeResolver())
          .extendDeclarations('childListening', childListeningResolver.resolver);

        const d = DefinitionsSet.empty('d')
          .extendDeclarations('a', buildFakeResolver())
          .extendDeclarations('b', buildFakeResolver())
          .extendDeclarations('listening', topLevelListeningResolver.resolver)
          .extendImports('child', child);

        ContainerService.callDefinitionsListeners(d);

        expect(topLevelListeningResolver.onEvent.mock.calls[0][0]).toEqual(child.declarations.get('childListening'));
        expect(topLevelListeningResolver.onEvent.mock.calls[1][0]).toEqual(child.declarations.get('childB'));
        expect(topLevelListeningResolver.onEvent.mock.calls[2][0]).toEqual(child.declarations.get('childA'));
        expect(topLevelListeningResolver.onEvent.mock.calls[3][0]).toEqual(d.declarations.get('listening'));
        expect(topLevelListeningResolver.onEvent.mock.calls[4][0]).toEqual(d.declarations.get('b'));
        expect(topLevelListeningResolver.onEvent.mock.calls[5][0]).toEqual(d.declarations.get('a'));
        expect(topLevelListeningResolver.onEvent).toBeCalledTimes(6);

        expect(childListeningResolver.onEvent.mock.calls[0][0]).toEqual(child.declarations.get('childListening'));
        expect(childListeningResolver.onEvent.mock.calls[1][0]).toEqual(child.declarations.get('childB'));
        expect(childListeningResolver.onEvent.mock.calls[2][0]).toEqual(child.declarations.get('childA'));
        expect(childListeningResolver.onEvent).toBeCalledTimes(3);
      });
    });
  });
});
