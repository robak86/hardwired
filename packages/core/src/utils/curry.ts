export function curry(fn, arity = fn.length) {
    return function _curry(...args) {
        if (args.length < arity) {
            return _curry.bind(null, ...args);
        }
        return fn(...args);
    };
}
