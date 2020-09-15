import { ModuleLookup } from "../ModuleLookup";
import { ModuleId } from "../ModuleId";
import { dependency } from "../../testing/TestResolvers";
import { AbstractDependencyResolver } from "../../resolvers/AbstractDependencyResolver";
import { ContainerContext } from "../../container/ContainerContext";
import { DependencyFactory } from "../RegistryRecord";

function setup() {
  const rootId = ModuleId.build('a');
  const child1Id = ModuleId.build('b');
  const child2Id = ModuleId.build('c');
  const grandChild1Id = ModuleId.build('d');
  const grandChild2Id = ModuleId.build('e');

  const root = new ModuleLookup(rootId);
  const child1 = new ModuleLookup(child1Id);
  const child2 = new ModuleLookup(child2Id);
  const grandChild1 = new ModuleLookup(grandChild1Id);
  const grandChild2 = new ModuleLookup(grandChild2Id);

  root.appendChild(child1);
  root.appendChild(child2);
  child1.appendChild(grandChild1);
  child2.appendChild(grandChild2);

  return {
    rootId,
    child1Id,
    child2Id,
    grandChild1Id,
    grandChild2Id,
    root,
    child1,
    child2,
    grandChild1,
    grandChild2,
  };
}

describe(`ModuleLookup`, () => {
  describe(`flattenModules`, () => {
    it(`returns flat object containing all modules`, async () => {
      const {
        rootId,
        child1Id,
        child2Id,
        grandChild1Id,
        grandChild2Id,
        root,
        child1,
        child2,
        grandChild1,
        grandChild2,
      } = setup();

      expect(root.flattenModules()).toEqual({
        [rootId.identity]: root,
        [child1Id.identity]: child1,
        [child2Id.identity]: child2,
        [grandChild1Id.identity]: grandChild1,
        [grandChild2Id.identity]: grandChild2,
      });
    });
  });

  describe(`findAncestorResolvers`, () => {
    class DiscoverableResolver extends AbstractDependencyResolver<any> {
      constructor() {
        super();
      }

      build(cache: ContainerContext): any {
        return null;
      }
    }

    it(`returns all resolvers registered in closest ancestor ModuleLookup instance`, async () => {
      const { root, child1, child2 } = setup();

      const discoverable = new DiscoverableResolver();
      const dependencyFactory = new DependencyFactory(discoverable.build);

      root.appendDependencyFactory('discoverable', discoverable, dependencyFactory);
      const discoveredFromChild1 = child1.findAncestorResolvers(DiscoverableResolver);
      const discoveredFromChild2 = child2.findAncestorResolvers(DiscoverableResolver);

      expect(discoveredFromChild1).toEqual([dependencyFactory]);
      expect(discoveredFromChild2).toEqual([dependencyFactory]);
    });

    it(`returns all resolvers registered one level up into ancestors hierarchy`, async () => {
      const { root, grandChild1, grandChild2 } = setup();

      const discoverable = new DiscoverableResolver();
      const dependencyFactory = new DependencyFactory(discoverable.build);

      root.appendDependencyFactory('discoverable', discoverable, dependencyFactory);
      const discoveredFromGrandChild1 = grandChild1.findAncestorResolvers(DiscoverableResolver);
      const discoveredFromGrandChild2 = grandChild2.findAncestorResolvers(DiscoverableResolver);

      expect(discoveredFromGrandChild1).toEqual([dependencyFactory]);
      expect(discoveredFromGrandChild2).toEqual([dependencyFactory]);
    });

    it(`returns all resolvers registered at any level up into ancestors hierarchy`, async () => {
      const { root, grandChild1, grandChild2, child1, child2 } = setup();

      const discoverable = new DiscoverableResolver();
      const dependencyFactory = new DependencyFactory(discoverable.build);

      const discoverable2 = new DiscoverableResolver();
      const dependencyFactory2 = new DependencyFactory(discoverable.build);

      root.appendDependencyFactory('discoverable', discoverable, dependencyFactory);
      child1.appendDependencyFactory('discoverable2', discoverable2, dependencyFactory2);
      child2.appendDependencyFactory('discoverable2', discoverable2, dependencyFactory2);

      const discoveredFromGrandChild1 = grandChild1.findAncestorResolvers(DiscoverableResolver);
      const discoveredFromGrandChild2 = grandChild2.findAncestorResolvers(DiscoverableResolver);

      expect(discoveredFromGrandChild1).toEqual([dependencyFactory, dependencyFactory2]);
      expect(discoveredFromGrandChild2).toEqual([dependencyFactory, dependencyFactory2]);
    });
  });

  describe(`findDependencyFactory`, () => {
    it(`returns correct dependency factory`, async () => {
      const { grandChild1Id, root, grandChild1 } = setup();

      const d1 = dependency(123);
      grandChild1.appendDependencyFactory('d1', d1, new DependencyFactory(d1.build));
      const dependencyFactory = root.findDependencyFactory(grandChild1Id, 'd1');
      expect(dependencyFactory!.get).toEqual(d1.build);
    });
  });
});
