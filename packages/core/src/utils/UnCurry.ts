import { IsFinite } from './IsFinite';

// prettier-ignore
export type UnCurry<T, TArgsAggregate extends any[] = []> =
  T extends (...args: infer TArgs) => infer TReturn ?
    IsFinite<
      TArgs,
      TReturn extends (...args: any[]) => any ? UnCurry<TReturn, [...TArgsAggregate, ...TArgs]> : (...args: [...TArgsAggregate, ...TArgs]) => TReturn,
      `...rest arguments are not supported`>
     :
    never;

export function uncurry<T extends (...args: any[]) => any>(fn: T): UnCurry<T> {
  type AnyFn = (...args: any[]) => any;

  const run = (fn: AnyFn, args: any[]) => {
    const arity = fn.length;

    const own = args.slice(0, arity);
    const rest = args.slice(arity);

    const result = fn(...own);

    if (typeof result === 'function') {
      return run(result, rest);
    } else {
      return result;
    }
  };

  return ((...args) => run(fn, args)) as any;
}
