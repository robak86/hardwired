import { TypeEqual } from 'ts-expect';
import { LifeTime } from './LifeTime';

// prettier-ignore
export type DerivedLifeTime<T extends LifeTime> =
    TypeEqual<T, LifeTime.singleton> extends true ? LifeTime.singleton :
    TypeEqual<T, LifeTime.request> extends true ? LifeTime.request :
    TypeEqual<T, LifeTime.scoped> extends true ? LifeTime.scoped :
    LifeTime.transient;
