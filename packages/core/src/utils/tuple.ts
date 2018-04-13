export function tuple<T1>(...args: [T1]): [T1];
export function tuple<T1, T2>(...args: [T1, T2]): [T1, T2];
export function tuple<T1, T2, T3>(...args: [T1, T2, T3]): [T1, T2, T3];
export function tuple<T1, T2, T3, T4>(...args: [T1, T2, T3, T4]): [T1, T2, T3, T4];
export function tuple<T1, T2, T3, T4, T5>(...args: [T1, T2, T3, T4, T5]): [T1, T2, T3, T4, T5];
export function tuple<T1, T2, T3, T4, T5, T6>(...args: [T1, T2, T3, T4, T5, T6]): [T1, T2, T3, T4, T5, T6];
export function tuple<T1, T2, T3, T4, T5, T6, T7>(...args: [T1, T2, T3, T4, T5, T6, T7]): [T1, T2, T3, T4, T5, T6, T7];
export function tuple(...args: any[]): any[] {
  return args;
}
