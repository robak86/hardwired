import { FromPathFactory } from './utils';
import { get, write } from './accessors';

// TODO: use proxy object for making sure that object is accessed through lens ?  (lens requires a lock, reads data, then releases the lock)

// TODO: no access to list!!!
// TODO: when it comes to TFrom ... lens shouldn't have to know whole type structure. path should be enough

// function zip<TFrom>();
//TODO: readonly lense ?

// TODO: rename lensOf<TReturn>
// TODO: rename lensReturning
export const lens = <TReturn>() => {
  const fromPath: FromPathFactory<TReturn> = path => new Lens(path) as any;
  const fromProp = <TKey extends string>(key: TKey): Lens<{ [K in TKey]: TReturn }, TReturn> => {
    return new Lens<{ [K in TKey]: TReturn }, TReturn>([key]);
  };

  return {
    fromProp,
    fromPath,
  };
};

// TODO: rename to LensFrom
export const lensLeft = <TFrom extends Record<string, any>>() => {
  // const fromPath: FromPathFactory<TFrom[TKey]> = path => new Lens(path) as any;

  const fromProp = <TKey extends keyof TFrom>(key: TKey): Lens<TFrom, TFrom[TKey]> => {
    return new Lens<TFrom, TFrom[TKey]>([key as any]);
  };

  return {
    fromProp,
    // fromPath
  };
};

export type LensType<T extends Lens<any, any>> = T extends Lens<infer TInput, any> ? TInput : never;

export class Lens<TFrom extends object, TReturn> {
  public readonly id!: string;

  constructor(protected path: string[]) {
    this.id = path.join(this.path.join('_')); // Don't use any UUID!! the identity
    // of the path is a path! (and type, but there is no way to check it at runtime
  }

  get(from: TFrom): TReturn {
    return get(this.path)(undefined)(from);
  }

  // TODO: its for compatibility with reader - use only single common method for reader and lens (probably get)
  run(from: TFrom): TReturn {
    return get(this.path)(undefined)(from);
  }

  getOr(defaultValue: TReturn, from: TFrom): TReturn;
  getOr(defaultValue: TReturn): (from: TFrom) => TReturn;
  getOr(...args: [TReturn, TFrom?]): ((from: TFrom) => TReturn) | TReturn {
    const defaultVal = args[0];

    if (args.length === 2) {
      return get(this.path)(defaultVal)(args[1]);
    } else {
      return get(this.path)(defaultVal);
    }
  }

  over(fn: (value: TReturn) => TReturn): TFrom {
    throw new Error('Implement me');
  }

  overAsync(fn: (value: TReturn) => Promise<TReturn>): Promise<TFrom> {
    throw new Error('Implement me');
  }

  overExtend() {}

  overExtendAsync() {}

  merge<TReturn2, TFrom2 extends TReturn & object>(nextLens: Lens<TFrom2, TReturn2>): Lens<TFrom, TReturn2> {
    return new Lens<TFrom, TReturn2>(this.path.concat(nextLens.path));
  }

  // over()

  //TODO: use conditional types to return TReturn ... or TReturn | undefined
  getOption(from: TFrom): TReturn;
  getOption(from: any): any {
    throw new Error('implement me');
  }

  append<TReturn2, TFrom2 extends TReturn & object>(nextLens: Lens<TFrom2, TReturn2>): Lens<TFrom, TReturn2> {
    return new Lens<TFrom, TReturn2>(this.path.concat(nextLens.path));
  }

  // getOptional(from: TDeepPartial<TFrom>):Option{}

  set(val: TReturn, target: TFrom): TFrom;
  set(val: TReturn): (target: TFrom) => TFrom;
  set(...args: [TReturn, TFrom?]): ((target: TFrom) => TFrom) | TFrom {
    if (args.length === 2) {
      return write(this.path)(args[0])<TFrom>(args[1] as TFrom);
    } else {
      return write(this.path)(args[0]);
    }
  }

  // TODO: write ? embed ?

  /*
    
    const appendMap = <Output extends object, Input extends object = {}>(
  fn: (input: Input) => Output
) => <T>(input: T & Input): T & Input & Output => {
  return { ...input, ...fn(input) };
};
      
     */
  extend(val: TReturn): <TExtendTarget extends object>(target: TExtendTarget) => TFrom & TExtendTarget;
  extend<TExtendTarget extends object>(val: TReturn, target: TExtendTarget): TFrom & TExtendTarget;
  extend(...args: [TReturn, TFrom?]): ((target: TFrom) => TFrom) | TFrom {
    if (args.length === 2) {
      return write(this.path)(args[0])<TFrom>(args[1] as TFrom);
    } else {
      return write(this.path)(args[0]);
    }
  }

  extendProvide(factory: (from: TFrom) => TReturn): LensProvide<TFrom> {
    const path = this.path;
    return {
      id: this.id,
      run(target) {
        const result = factory(target);
        const kurwaaaaaaaaaa = write(path)(result)(target);
        return kurwaaaaaaaaaa;
      },
    } as any;
  }

  provide(value: TReturn): LensProvide<TFrom> {
    const path = this.path;
    return {
      id: this.id,
      run(target) {
        const kurwaaaaaaaaaa = write(path)(value)(target);
        return kurwaaaaaaaaaa;
      },
    } as any;
  }
}

export interface IAsyncProvide<TFrom> {
  run<TExtendTarget extends object>(target: TExtendTarget): Promise<TFrom & TExtendTarget>;
}

export type LensProvide<TFrom> = {
  readonly id: string;
  run<TExtendTarget extends object>(target: TExtendTarget): TFrom & TExtendTarget;
};
