import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { Resolution } from '../definitions/abstract/Resolution.js';
import { EagerDefinitions } from './EagerDefinitions.js';
import { ContainerContext } from '../context/ContainerContext.js';
import { ContainerInterceptor } from '../context/ContainerInterceptor.js';

export type DefinitionAnnotation<TDef extends AnyInstanceDefinition<any, any, any>> = (definition: TDef) => TDef;

export class EagerDefinitionsInterceptor implements ContainerInterceptor {
  private _eagerDefinitions: AnyInstanceDefinition<any, any, any>[] = [];

  constructor(
    private _lazily: boolean = true,
    private _definitions: EagerDefinitions = new EagerDefinitions(),
  ) {}

  eager: DefinitionAnnotation<AnyInstanceDefinition<LifeTime.singleton | LifeTime.scoped, any, any>> = definition => {
    if (definition.strategy !== LifeTime.singleton && definition.strategy !== LifeTime.scoped) {
      throw new Error('Eager can be used only with singleton or scoped life time');
    }

    if (definition.resolution === Resolution.sync) {
      this._definitions.append(definition);
    } else {
      this._definitions.appendAsync(definition);
    }

    return definition;
  };

  onDefinitionEnter(definition: AnyInstanceDefinition<any, any, any>) {
    if (definition.resolution === Resolution.sync) {
      this._eagerDefinitions.push(...this._definitions.getInvertedDefinitions(definition.id));
    }

    if (definition.resolution === Resolution.async) {
      this._eagerDefinitions.push(...this._definitions.getInvertedAsyncDefinitions(definition.id));
    }
  }

  onRequestStart(definition: AnyInstanceDefinition<any, any, any>) {
    this._eagerDefinitions = [];
  }

  onRequestEnd<T>(definition: AnyInstanceDefinition<T, any, any>, context: ContainerContext, instance: T): T {
    for (const definition of this._eagerDefinitions) {
      context.buildWithStrategy(definition);
    }

    return instance;
  }

  async onAsyncRequestEnd<T>(
    definition: AnyInstanceDefinition<T, any, any>,
    context: ContainerContext,
    instance: T,
  ): Promise<T> {
    for (const definition of this._eagerDefinitions) {
      await context.buildWithStrategy(definition);
    }

    return instance;
  }
}

export const eagerInterceptor = new EagerDefinitionsInterceptor(true);
export const eager = eagerInterceptor.eager;
