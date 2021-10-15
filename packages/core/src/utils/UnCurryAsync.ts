import { IsFinite } from './IsFinite';

type Awaited<T> = T extends Promise<infer TInner> ? TInner : T

// prettier-ignore
export type UnCurryAsync<T, TArgsAggregate extends any[] = []> =
  T extends (...args: infer TArgs) => infer TReturn ?
    IsFinite<
      TArgs,
      Awaited<TReturn> extends (...args: any[]) => any ? UnCurryAsync<Awaited<TReturn>, [...TArgsAggregate, ...TArgs]> : (...args: [...TArgsAggregate, ...TArgs]) => Promise<Awaited<TReturn>>,
      never>
     :
    never;


const fn1 = async (a: number) => (b:string) => 123
const fn2 = async (a: number) => async (b:string) => 123
const fn3 =  (a: number) => async (b:string) => 123

type T1 = UnCurryAsync<typeof fn1>
type T2 = UnCurryAsync<typeof fn2>
type T3 = UnCurryAsync<typeof fn3>

export function uncurryAsync<T extends (...args: any[]) => any>(fn: T): UnCurryAsync<T> {
  type AnyFn = (...args: any[]) => Promise<any>;

  const run = async (fn: AnyFn, args: any[]) => {
    const arity = fn.length;

    const own = args.slice(0, arity);
    const rest = args.slice(arity);

    const result = await fn(...own);

    if (typeof result === 'function') {
      return await run(result, rest);
    } else {
      return result;
    }
  };

  return ((...args) => run(fn, args)) as any;
}
