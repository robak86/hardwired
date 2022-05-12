export function curry(fn: (...args:any[]) => any, arity = fn.length) {
    return function _curry(...args:any[]):any {
        if (args.length < arity) {
            return _curry.bind(null, ...args);
        }
        return fn(...args);
    };
}
