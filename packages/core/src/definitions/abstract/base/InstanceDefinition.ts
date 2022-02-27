import { ContainerContext } from '../../../context/ContainerContext';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { v4 } from 'uuid';
import { BaseDefinition } from './BaseDefinition';

export type InstanceDefinitionContext = ContainerContext;

export interface InstanceDefinitionParams<TInstance, TLifeTime extends LifeTime = any, TExternals extends any[] = []> {
  strategy: TLifeTime;
  create: (context: InstanceDefinitionContext, _?: TExternals) => TInstance;
  externals: Array<InstanceDefinition<any, any>>;
  externalsValues?: any[];
  id?: string;
}

export class InstanceDefinition<
  TInstance,
  TLifeTime extends LifeTime = any,
  TExternals extends any[] = [],
> extends BaseDefinition<TInstance, TLifeTime, TExternals, Resolution.sync> {
  constructor(params: InstanceDefinitionParams<TInstance, TLifeTime, TExternals>) {
    super(Resolution.sync, params);
  }

  // readonly id: string;
  // readonly strategy: TLifeTime;
  // readonly resolution: Resolution.sync = Resolution.sync; // discriminator used for disabling usage of async defs as a dependencies to sync def
  // readonly create: (context: InstanceDefinitionContext, _?: TExternals) => TInstance; // TODO: create should be abstract and implemented by concrete definitions
  // readonly externals: Array<InstanceDefinition<any, any>>; // TODO: make protected and hide logic for creating externals within this class
  // readonly scopeOverrides: InstanceDefinition<any>[];
  // readonly externalsValues: any[];
  //
  // protected _hash: string = v4();
  //
  // constructor({
  //   strategy,
  //   create,
  //   externals,
  //   id = v4(),
  //   externalsValues = [],
  // }: InstanceDefinitionParams<TInstance, TLifeTime, TExternals>) {
  //   if (strategy === LifeTime.singleton && externals.length > 0) {
  //     throw new Error('Externals with singleton life time is not supported');
  //   }
  //
  //   this.id = id;
  //   this.externals = externals;
  //   this.create = create;
  //   this.strategy = strategy;
  //   this.externalsValues = externalsValues;
  //
  //   if (externalsValues.length !== this.externalsValues.length) {
  //     throw new Error('Invalid external params count');
  //   }
  //
  //   const boundExternals = {};
  //   this.externalsValues.forEach((extValue, idx) => {
  //     const externalDef = this.externals[idx];
  //     boundExternals[externalDef.id] = extValue;
  //   });
  //
  //   this.scopeOverrides = Object.keys(boundExternals).map(id => {
  //     return new InstanceDefinition({
  //       id,
  //       externals: [],
  //       strategy: LifeTime.transient,
  //       create: () => boundExternals[id],
  //     });
  //   });
  // }
  //
  // // get hash(): string {
  // //   return this._hash;
  // // }
  //
  // get hasScopeOverrides(): boolean {
  //   return this.scopeOverrides.length > 0;
  // }
  //
  // withoutOverrides(): InstanceDefinition<TInstance, TLifeTime, []> {
  //   return new InstanceDefinition<TInstance, TLifeTime, []>({
  //     id: this.id,
  //     create: this.create as any,
  //     strategy: this.strategy,
  //     externals: [],
  //     externalsValues: [],
  //   });
  // }
  //
  // bind(...externals: TExternals): InstanceDefinition<TInstance, TLifeTime, []> {
  //   return new InstanceDefinition<TInstance, TLifeTime, []>({
  //     id: this.id,
  //     create: this.create as any,
  //     externals: this.externals,
  //     strategy: this.strategy,
  //     externalsValues: externals,
  //   });
  // }
}
