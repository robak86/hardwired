import { AbstractDependencyResolver } from '../../resolvers/AbstractDependencyResolver';
import { ModuleRegistry } from '../../module/ModuleRegistry';
import { ContainerCache } from '../container-cache';
import { ContainerEvents } from '../ContainerEvents';
import { DependencyResolver } from "../../resolvers/DependencyResolver";

describe(`ContainerEvents`, () => {
  // function setup() {
  //   const onSpecificDefinitionAppendSpy = jest.fn();
  //
  //   class Resolver1 extends AbstractDependencyResolver<any, any> {
  //     build(registry: ModuleRegistry<any>, cache: ContainerCache, ctx) {}
  //     forEach(iterFn: (resolver: DependencyResolver<any, any>) => any) {
  //     }
  //   }
  //
  //   class Resolver2 extends AbstractDependencyResolver<any, any> {
  //     build(registry: ModuleRegistry<any>, cache: ContainerCache, ctx) {}
  //     onRegister(events: ContainerEvents) {
  //       events.onSpecificDefinitionAppend.add(Resolver1, onSpecificDefinitionAppendSpy);
  //     }
  //     forEach(iterFn: (resolver: DependencyResolver<any, any>) => any) {
  //     }
  //   }
  //
  //   return { Resolver1, Resolver2, onSpecificDefinitionAppendSpy };
  // }
  //
  // describe(`onSpecificDefinitionAppend`, () => {
  //   it(`calls listener with all related resolvers`, async () => {
  //
  //   });
  // });
});
