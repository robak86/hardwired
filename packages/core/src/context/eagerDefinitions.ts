import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';

export const DEFAULT_EAGER_GROUP = 'default';

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

class EagerDefinitions {
  private _groups = new Map<string, EagerDefinitionsGroup>();

  getGroup(group: string) {
    if (!this._groups.has(group)) {
      throw new Error(`Eager group with id ${group} does not exist`);
    }
    return this._groups.get(group)!;
  }

  upsertGroup(group: string) {
    if (!this._groups.has(group)) {
      this._groups.set(group, new EagerDefinitionsGroup());
    }
    return this._groups.get(group)!;
  }

  getGroupNames() {
    return this._groups.keys();
  }

  getReferencingDefinitions(definitionId: string, ...groups: string[]) {}

  getDefinitions(...groups: string[]): Iterable<InstanceDefinition<any, any>> {
    const definitions: InstanceDefinition<any, any>[] = [];

    if (groups.length === 0) {
      for (const group of this._groups.values()) {
        definitions.push(...group.definitions);
      }
    } else {
      for (const group of groups) {
        definitions.push(...this.getGroup(group).definitions);
      }
    }

    return definitions;
  }

  getAsyncDefinitions(...groups: string[]): Iterable<AsyncInstanceDefinition<any, any>> {
    const definitions: AsyncInstanceDefinition<any, any>[] = [];

    if (groups.length === 0) {
      for (const group of this._groups.values()) {
        definitions.push(...group.asyncDefinitions);
      }
    } else {
      for (const group of groups) {
        definitions.push(...this.getGroup(group).asyncDefinitions);
      }
    }

    return definitions;
  }

  clear() {
    this._groups.clear();
  }
}

const ___eagerDefinitions = new EagerDefinitionsGroup();
export const getEagerDefinitions = () => ___eagerDefinitions;
