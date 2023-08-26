export interface HydrateAwareState<T> {
  readonly state: T | null;
  setState(data: T): void;
}

export const isHydratable = (val: any): val is HydrateAwareState<any> => {
  return typeof val.setState === 'function' && !!getPropertyDescriptor(val, 'state');
};

function getPropertyDescriptor(obj: any, prop: string): PropertyDescriptor | undefined {
  let desc;
  do {
    desc = Object.getOwnPropertyDescriptor(obj, prop);
  } while (!desc && (obj = Object.getPrototypeOf(obj)));

  return desc;
}
