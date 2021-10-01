import { ClassType } from '../utils/ClassType';

// Class | const | factory | decorator
export type InstanceEntryTarget<T> = ClassType<T, any> | T | (() => T) | ((prev: T) => T);


// this should be a discriminated union instead to avoid InstanceEntryTarget union
export type InstanceEntry<T, TExternal = never> = {
  id: string; // should be unique and prefixed with function name, class name (something which will make debugging easier)
  strategy: symbol; // this enables basic reflection :D just recursively iterate over dependencies array :D
  target: InstanceEntryTarget<T>; // thunk returning class reference, function, or const value.
  // Decision how the target should be interpreted and how it should be instantiated (if necessary) will be delegated to strategy implementation
  dependencies: Array<InstanceEntry<any>>;
  prev?: InstanceEntry<T>
};
