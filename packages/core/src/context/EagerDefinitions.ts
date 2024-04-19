import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';

class EagerDefinitionsGroup {
  private _definitions = new Map<string, InstanceDefinition<any, any>>();
  private _invertedDefinitions = new Map<string, InstanceDefinition<any, any>[]>();

  private _asyncDefinitions = new Map<string, AsyncInstanceDefinition<any, any>>();
  private _invertedAsyncDefinitions = new Map<string, AsyncInstanceDefinition<any, any>[]>();

  get definitions() {
    return this._definitions.values();
  }

  get asyncDefinitions() {
    return this._asyncDefinitions.values();
  }

  getInvertedDefinitions(definitionId: string) {
    return this._invertedDefinitions.get(definitionId) ?? [];
  }

  getInvertedAsyncDefinitions(definitionId: string) {
    return this._invertedAsyncDefinitions.get(definitionId) ?? [];
  }

  append(definition: InstanceDefinition<any, any>) {
    if (this._definitions.has(definition.id)) {
      throw new Error(`Eager definition with id ${definition.id} already exists`);
    }
    this._definitions.set(definition.id, definition);

    definition.dependencies.forEach(dependency => {
      if (!this._invertedDefinitions.has(dependency.id)) {
        this._invertedDefinitions.set(dependency.id, []);
      }
      this._invertedDefinitions.get(dependency.id)!.push(definition);
    });
  }

  appendAsync(definition: AsyncInstanceDefinition<any, any>) {
    if (this._asyncDefinitions.has(definition.id)) {
      throw new Error(`Eager async definition with id ${definition.id} already exists`);
    }
    this._asyncDefinitions.set(definition.id, definition);

    definition.dependencies.forEach(dependency => {
      if (!this._invertedAsyncDefinitions.has(dependency.id)) {
        this._invertedAsyncDefinitions.set(dependency.id, []);
      }
      this._invertedAsyncDefinitions.get(dependency.id)!.push(definition);
    });
  }

  clear() {
    this._definitions.clear();
    this._asyncDefinitions.clear();
  }
}

const ___eagerDefinitions = new EagerDefinitionsGroup();
export const getEagerDefinitions = () => ___eagerDefinitions;
