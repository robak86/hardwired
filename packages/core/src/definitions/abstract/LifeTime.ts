import { TypeEqual } from 'ts-expect';

export enum LifeTime {
  singleton = 'singleton',
  transient = 'transient',
  request = 'request',
  scoped = 'scoped',
}

export enum Resolution {
  sync = 'sync',
  async = 'async',
  external = 'external',
}

// prettier-ignore
export type DerivedLifeTime<T extends LifeTime> =
    TypeEqual<T, LifeTime.singleton> extends true ? LifeTime.singleton :
    TypeEqual<T, LifeTime.request> extends true ? LifeTime.request :
    TypeEqual<T, LifeTime.scoped> extends true ? LifeTime.scoped :
    LifeTime.transient;
