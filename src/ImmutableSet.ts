export class ImmutableSet<D extends Record<string, any>> {
  static empty(): ImmutableSet<{}> {
    return new ImmutableSet<{}>({});
  }

  private constructor(private records: D) {}

  get<K extends keyof D>(key: K): D[K] {
    return this.records[key];
  }

  hasKey(key: any): boolean {
    return !!this.records[key];
  }

  get values(): Array<D[keyof D]> {
    return Object.values(this.records);
  }

  get keys(): Array<keyof D> {
    return Object.keys(this.records);
  }

  remove<TKey extends keyof D>(key: TKey): ImmutableSet<Omit<D, TKey>> {
    const cloned: D = { ...this.records };
    delete cloned[key];
    return new ImmutableSet(cloned) as any;
  }

  set<TKey extends keyof D, TValue extends D[TKey]>(
    key: TKey,
    value: TValue
  ): ImmutableSet<D> {
    return new ImmutableSet({
      ...this.records,
      [key]: value,
    });
  }

  mapValues<TNext>(
    mapFn: (value: D[keyof D], key: keyof D) => TNext
  ): ImmutableSet<TNext> {
    const next: any = {};
    this.keys.forEach((key) => {
      next[key] = mapFn(this.get(key), key);
    });

    return new ImmutableSet(next);
  }

  forEach(iterFn: (val: D[keyof D], key: keyof D) => void) {
    this.keys.forEach((key) => {
      iterFn(this.get(key), key);
    });
  }

  // extend<TKey extends string, TValue>(
  //   key: TKey,
  //   value: TValue
  // ): NotDuplicated<
  //   TKey,
  //   TValue,
  //   ImmutableSet<D & { [K in keyof TKey]: TValue }>
  // > {
  //   return new ImmutableSet({
  //     ...this.records,
  //     [key]: value,
  //   }) as any;
  // }

  extend<TKey extends string, TValue>(
    key: TKey,
    value: TValue
  ): ImmutableSet<D & { [K in TKey]: TValue }> {
    return new ImmutableSet({
      ...this.records,
      [key]: value,
    });
  }
}
