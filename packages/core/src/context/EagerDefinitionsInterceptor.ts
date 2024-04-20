import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { Resolution } from '../definitions/abstract/Resolution.js';
import { getEagerDefinitions } from './EagerDefinitions.js';
import { ContainerContext, ContainerInterceptor } from './ContainerContext.js';

export type DefinitionAnnotation<TDef extends AnyInstanceDefinition<LifeTime, any>> = (definition: TDef) => object;

const eager: DefinitionAnnotation<AnyInstanceDefinition<LifeTime.singleton | LifeTime.scoped, any>> = definition => {
  if (definition.strategy !== LifeTime.singleton && definition.strategy !== LifeTime.scoped) {
    throw new Error('Eager can be used only with singleton or scoped life time');
  }
  return { eager: true };
};

export class EagerDefinitionsInterceptor implements ContainerInterceptor {
  private _eagerDefinitions: AnyInstanceDefinition<any, any>[] = [];

  constructor(private lazily: boolean = false) {
    // TODO:
  }

  // interceptSync<T>(definition: InstanceDefinition<T, any>, context: ContainerContext): T {
  //   this._eagerDefinitions.push(...getEagerDefinitions().getInvertedDefinitions(definition.id));
  //
  //   return definition.create(context);
  // }
  //
  // interceptAsync<T>(definition: AsyncInstanceDefinition<T, any>, context: ContainerContext): Promise<T> {
  //   console.log('interceptAsync', definition.meta?.name);
  //   console.log(
  //     'pushing inverted async definitions',
  //     getEagerDefinitions()
  //       .getInvertedAsyncDefinitions(definition.id)
  //       .map(d => d.meta?.name),
  //   );
  //   this._eagerDefinitions.push(...getEagerDefinitions().getInvertedAsyncDefinitions(definition.id));
  //
  //   return definition.create(context);
  // }

  onDefinitionEnter(definition: AnyInstanceDefinition<any, any>) {
    console.log('onDefinitionBuild', definition.meta?.name);

    if (definition.resolution === Resolution.sync) {
      this._eagerDefinitions.push(...getEagerDefinitions().getInvertedDefinitions(definition.id));
    }

    if (definition.resolution === Resolution.async) {
      this._eagerDefinitions.push(...getEagerDefinitions().getInvertedAsyncDefinitions(definition.id));
    }
  }

  onRequestStart(definition: AnyInstanceDefinition<any, any>) {
    console.log('onRequestStart', definition.meta?.name);
    this._eagerDefinitions = [];
  }

  onRequestEnd<T>(definition: AnyInstanceDefinition<T, any>, context: ContainerContext, instance: T): T {
    console.log(
      'onRequestEnd: eager deps to instantiate',
      this._eagerDefinitions.map(d => d.meta?.name),
    );

    for (const definition of this._eagerDefinitions) {
      context.buildWithStrategy(definition);
    }

    return instance;
  }

  async onAsyncRequestEnd<T>(
    definition: AnyInstanceDefinition<T, any>,
    context: ContainerContext,
    instance: T,
  ): Promise<T> {
    console.log(
      'onAsyncRequestEnd: eager deps to instantiate',
      this._eagerDefinitions.map(d => d.meta?.name),
    );

    for (const definition of this._eagerDefinitions) {
      await context.buildWithStrategy(definition);
    }

    return instance;
  }
}
