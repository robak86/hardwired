import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';

class EagerDefinitionsGroup {
  private _definitions = new Map<string, InstanceDefinition<any, any>>();
  private _invertedDefinitions = new Map<string, InstanceDefinition<any, any>[]>();

  private _asyncDefinitions = new Map<string, AnyInstanceDefinition<any, any>>();
  private _invertedAsyncDefinitions = new Map<string, AnyInstanceDefinition<any, any>[]>();

  get definitions() {
    return this._definitions.values();
  }

  get asyncDefinitions() {
    return this._asyncDefinitions.values();
  }

  getInvertedDefinitions(definitionId: string) {
    return this._invertedDefinitions.get(definitionId) ?? [];
  }

  // TODO: there is a chance that we could store together sync and async definitions
  getInvertedAsyncDefinitions(definitionId: string) {
    return this._invertedAsyncDefinitions.get(definitionId) ?? [];
  }

  append(definition: InstanceDefinition<any, any>) {
    if (this._definitions.has(definition.id)) {
      return;
    }

    this._definitions.set(definition.id, definition);

    definition.dependencies.forEach(dependency => {
      if (!this._invertedDefinitions.has(dependency.id)) {
        this._invertedDefinitions.set(dependency.id, []);
      }
      this._invertedDefinitions.get(dependency.id)!.push(definition);

      this.append(dependency);
    });
  }

  appendAsync(definition: AnyInstanceDefinition<any, any>) {
    console.log('appendAsyncEager', definition.meta?.name);
    if (this._asyncDefinitions.has(definition.id)) {
      return;
    }

    this._asyncDefinitions.set(definition.id, definition);

    definition.dependencies.forEach(dependency => {
      if (!this._invertedAsyncDefinitions.has(dependency.id)) {
        this._invertedAsyncDefinitions.set(dependency.id, []);
      }
      this._invertedAsyncDefinitions.get(dependency.id)!.push(definition);

      this.appendAsync(dependency);
    });
  }

  clear() {
    this._definitions.clear();
    this._asyncDefinitions.clear();
  }
}

const ___eagerDefinitions = new EagerDefinitionsGroup();
export const getEagerDefinitions = () => ___eagerDefinitions;
