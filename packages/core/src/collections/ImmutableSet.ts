import invariant from "tiny-invariant";

export class ImmutableSet<D extends Record<string, any>> {
  static empty(): ImmutableSet<{}> {
    return new ImmutableSet<{}>({}, []);
  }

  protected constructor(
    protected readonly records: { [K in keyof D]: Array<D[K]> },
    protected readonly orderedKeys: string[],
  ) {}

  get<K extends keyof D & string>(key: K): D[K] {
    return this.records?.[key]?.[0] as D[K];
  }

  getOr<K extends keyof D & string>(key: K, defaultValue: D[K]): D[K] {
    return this.get(key) || defaultValue;
  }

  hasKey<TKey>(key: string | number | symbol): key is keyof D {
    return !!this.records[key as string];
  }

  reverse(): ImmutableSet<D> {
    return new ImmutableSet(this.records, [...this.orderedKeys].reverse());
  }

  get keys(): Array<keyof D & string> {
    return this.orderedKeys;
  }

  remove<TKey extends keyof D>(key: TKey): ImmutableSet<Omit<D, TKey>> {
    const cloned: { [K in keyof D]: Array<D[K]> } = { ...this.records };

    delete cloned[key];

    return new ImmutableSet<Omit<D, TKey>>(
      cloned,
      this.orderedKeys.filter(key => key !== key),
    );
  }

  set<TKey extends keyof D & string, TValue extends D[TKey]>(key: TKey, value: TValue): ImmutableSet<D> {
    invariant(this.records[key], `Cannot set value for non existing key. Use .extend to extend the set with new key`);

    return new ImmutableSet<D>(
      {
        ...this.records,
        [key]: [value, ...this.records[key]],
      },
      [...this.orderedKeys, key],
    );
  }

  replace<TKey extends keyof D & string, TValue extends D[TKey]>(key: TKey, value: TValue): ImmutableSet<D> {
    invariant(this.records[key], `Cannot replaced not existing value: ${key}`);

    return new ImmutableSet<D>(
      {
        ...this.records,
        [key]: [value, ...this.records[key]],
      },
      [...this.orderedKeys, key],
    );
  }

  forEach(iterFn: (val: D[keyof D], key: keyof D) => void) {
    const idx = {};
    this.orderedKeys.forEach(key => (idx[key] = this.records[key].length - 1));

    this.orderedKeys.forEach(key => {
      iterFn(this.records[key][idx[key]], key);
      idx[key] -= 1;
    });
  }

  merge<T extends Record<string, any>>(other: ImmutableSet<T>): ImmutableSet<T & D> {
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

    return new ImmutableSet<T & D>(mergedRecords as any, otherKeys as any);
  }

  get entries(): Array<[string, any]> {
    return this.keys.map(key => [key, this.records[key][0]]) as any;
  }

  extend<TKey extends string, TValue>(key: TKey, value: TValue): ImmutableSet<D & { [K in TKey & string]: TValue }> {
    invariant(!this.records[key], `Cannot extend set with key: ${key}. It already exists`);

    return new ImmutableSet(
      {
        ...this.records,
        [key]: [value, ...(this.records[key] || [])],
      },
      [...this.orderedKeys, key],
    ) as any;
  }
}
