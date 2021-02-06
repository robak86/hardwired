import invariant from 'tiny-invariant';

export class ImmutableMap<D extends Record<string, any>> {
  static empty(): ImmutableMap<{}> {
    return new ImmutableMap<{}>({}, []);
  }

  static fromObjectUnordered<TObj extends Record<string, any>>(
    obj: TObj,
    orderedKeys: string[] = Object.keys(obj),
  ): ImmutableMap<TObj> {
    return new ImmutableMap<TObj>(obj, orderedKeys);
  }

  protected constructor(
    protected readonly records: { [K in keyof D]: D[K] },
    protected readonly orderedKeys: string[],
  ) {}

  get<K extends keyof D & string>(key: K): D[K] {
    return this.records[key];
  }

  getOr<K extends string>(key: K, defaultValue: D[K]): D[K] {
    return this.get(key) || defaultValue;
  }

  hasKey(key): key is keyof D {
    return !!this.records[key];
  }

  reverse(): ImmutableMap<D> {
    return new ImmutableMap(this.records, [...this.orderedKeys].reverse());
  }

  get keys(): Array<keyof D & string> {
    return this.orderedKeys;
  }

  get values(): Array<D[keyof D]> {
    return this.keys.map(key => this.records[key]);
  }

  remove<TKey extends keyof D>(key: TKey): ImmutableMap<Omit<D, TKey>> {
    const cloned = { ...this.records };

    delete cloned[key];

    return new ImmutableMap<Omit<D, TKey>>(
      cloned,
      this.orderedKeys.filter(existingKey => existingKey !== key),
    );
  }

  set<TKey extends keyof D & string, TValue extends D[TKey]>(key: TKey, value: TValue): ImmutableMap<D> {
    invariant(this.records[key], `Cannot set value for non existing key. Use .extend to extend the set with new key`);

    return new ImmutableMap<D>(
      {
        ...this.records,
        [key]: value,
      },
      [...this.orderedKeys],
    );
  }

  replace<TKey extends keyof D & string, TValue extends D[TKey]>(key: TKey, value: TValue): ImmutableMap<D> {
    invariant(this.records[key], `Cannot replaced not existing value: ${key}`);

    return new ImmutableMap<D>(
      {
        ...this.records,
        [key]: value,
      },
      [...this.keys],
    );
  }

  update<TKey extends keyof D & string, TValue extends D[TKey]>(
    key: TKey,
    fn: (prevValue: TValue) => TValue,
  ): ImmutableMap<D> {
    invariant(this.records[key], `Cannot replaced not existing value: ${key}`);

    const newValue = fn(this.records[key]);
    return this.replace(key, newValue);
  }

  forEach(iterFn: (val: D[keyof D], key: keyof D) => void) {
    this.orderedKeys.forEach(key => iterFn(this.records[key], key));
  }

  merge<T extends Record<string, any>>(other: ImmutableMap<T>): ImmutableMap<T & D> {
    const mergedRecords = {
      ...this.records,
      ...other.records,
    };

    const ownKeys = [...this.keys];
    const otherKeys = [...other.keys];

    ownKeys.reverse().forEach((ownKey: any) => {
      if (!otherKeys.includes(ownKey)) {
        otherKeys.unshift(ownKey);
      }
    });

    return new ImmutableMap<T & D>(mergedRecords, otherKeys);
  }

  get entries(): Array<[string, any]> {
    return this.keys.map(key => [key, this.records[key]]);
  }

  extend<TKey extends string, TValue>(key: TKey, value: TValue): ImmutableMap<D & Record<TKey, TValue>> {
    invariant(!this.records[key], `Cannot extend set with key: ${key}. It already exists`);

    return new ImmutableMap<D & Record<TKey, TValue>>(
      {
        ...this.records,
        [key]: value,
      },
      [...this.orderedKeys, key],
    );
  }

  extendOrSet<TKey extends string, TValue>(key: TKey, value: TValue): ImmutableMap<D & Record<TKey, TValue>> {
    if (this.hasKey(key)) {
      return this.set(key, value as D[TKey]);
    } else {
      return this.extend(key, value);
    }
  }
}
