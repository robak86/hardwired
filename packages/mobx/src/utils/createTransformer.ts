import { _isComputingDerivation, computed, IComputedValue, IComputedValueOptions, onBecomeUnobserved } from 'mobx';
import invariant from 'tiny-invariant';

type MemoizationKey = string | number | boolean;

export type ITransformer<A extends Array<MemoizationKey>, B> = (...params: A) => B;

export type ITransformerParams<A, B> = {
  onCleanup?: (resultObject: B | undefined, sourceObject?: A) => void;
  debugNameGenerator?: (sourceObject?: A) => string;
  keepAlive?: boolean;
} & Omit<IComputedValueOptions<B>, 'name'>;

let memoizationId = 0;

export function createTransformer<A extends Array<MemoizationKey>, B>(
  transformer: ITransformer<A, B>,
  onCleanup?: (resultObject: B | undefined, sourceObject?: A) => void,
): ITransformer<A, B>;
export function createTransformer<A extends Array<MemoizationKey>, B>(
  transformer: ITransformer<A, B>,
  arg2?: ITransformerParams<A, B>,
): ITransformer<A, B>;
/**
 * Creates a function that maps an object to a view.
 * The mapping is memoized.
 *
 * See the [transformer](#createtransformer-in-detail) section for more details.
 *
 * @param transformer
 * @param onCleanup
 */

export function createTransformer<A extends Array<MemoizationKey>, B>(
  transformer: ITransformer<A, B>,
  arg2?: any,
): ITransformer<A, B> {
  invariant(
    typeof transformer === 'function' && transformer.length < 2,
    'createTransformer expects a function that accepts one argument',
  );

  // Memoizes: object id -> reactive view that applies transformer to the object
  let views: { [id: number]: IComputedValue<B> } = {};
  let onCleanup: Function | undefined = undefined;
  let keepAlive: boolean = false;
  let debugNameGenerator: Function | undefined = undefined;
  if (typeof arg2 === 'object') {
    onCleanup = arg2.onCleanup;
    keepAlive = arg2.keepAlive !== undefined ? arg2.keepAlive : false;
    debugNameGenerator = arg2.debugNameGenerator;
  } else if (typeof arg2 === 'function') {
    onCleanup = arg2;
  }

  function createView(sourceIdentifier: string, sourceObject: A) {
    let latestValue: B;
    let computedValueOptions = {};
    if (typeof arg2 === 'object') {
      onCleanup = arg2.onCleanup;
      debugNameGenerator = arg2.debugNameGenerator;
      computedValueOptions = arg2;
    } else if (typeof arg2 === 'function') {
      onCleanup = arg2;
    } else {
      onCleanup = undefined;
      debugNameGenerator = undefined;
    }
    const prettifiedName = debugNameGenerator
      ? debugNameGenerator(sourceObject)
      : `Transformer-${(<any>transformer).name}-${sourceIdentifier}`;
    const expr = computed(
      () => {
        return (latestValue = transformer(...sourceObject));
      },
      {
        ...computedValueOptions,
        name: prettifiedName,
      },
    );
    if (!keepAlive) {
      const disposer = onBecomeUnobserved(expr, () => {
        delete views[sourceIdentifier];
        disposer();
        if (onCleanup) onCleanup(latestValue, sourceObject);
      });
    }
    return expr;
  }

  // let memoWarned = false;
  return (...params: A) => {
    const identifier = getMemoizationId(params);
    let reactiveView = views[identifier];
    if (reactiveView) return reactiveView.get();
    if (!keepAlive && !_isComputingDerivation()) {
      // if (!memoWarned) {
      //   console.warn(
      //     "invoking a transformer from outside a reactive context won't memorized " +
      //       'and is cleaned up immediately, unless keepAlive is set',
      //   );
      //   memoWarned = true;
      // }
      const value = transformer(...params);
      if (onCleanup) onCleanup(value, params);
      return value;
    }
    // Not in cache; create a reactive view
    reactiveView = views[identifier] = createView(identifier, params);
    return reactiveView.get();
  };
}

function getMemoizationId(params: MemoizationKey[]) {
  return params
    .map(param => {
      const objectType = typeof param;
      if (objectType === 'string') return `string:${param}`;
      if (objectType === 'number') return `number:${param}`;
      if (param === null || (objectType !== 'object' && objectType !== 'function'))
        throw new Error(`[mobx-utils] transform expected an object, function, string or number, got: ${String(param)}`);
      throw new Error('Cannot memoize by object param');
    })
    .join('.');
}
