import { Definition } from '../definitions/abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';

export class InstancesMap {
  static create(): InstancesMap {
    return new InstancesMap(new Map(), true);
  }

  protected constructor(
    private _instances: Map<symbol, any>,
    private _pristine: boolean,
  ) {}

  upsert<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    if (this.has(definition.id)) {
      return this.get(definition.id);
    } else {
      const instance = definition.create(container, ...args);
      this.set(definition.id, instance);
      return instance;
    }
  }

  protected has(definitionId: symbol): boolean {
    return this._instances.has(definitionId);
  }

  protected set(definitionId: symbol, instance: any): void {
    if (!this._pristine) {
      this._instances = new Map(this._instances);
      this._pristine = true;
    }

    this._instances.set(definitionId, instance);
  }

  protected get(definitionId: symbol): any | undefined {
    return this._instances.get(definitionId);
  }

  clone(): InstancesMap {
    return new InstancesMap(this._instances, false);
  }
}
