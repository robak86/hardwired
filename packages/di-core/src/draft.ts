export type Item<TKey extends string, TValue> = {
  key: TKey;
  value: TValue;
};

type ItemRecord<T> = T extends Item<infer TKey, infer TValue> ? Record<TKey, TValue> : any;

const item = <TKey extends string, TValue>(key: TKey, value: TValue): Item<TKey, TValue> => {
  return null as any;
};

function composeReverse<
  TKey1 extends string,
  TKey2 extends string,
  TValue1,
  TValue2,
  T1 extends () => Item<TKey1, TValue1>,
  T2 extends (ctx: ItemRecord<ReturnType<T1>>) => Item<TKey2, TValue2>
>(params: [T1, T2]): ItemRecord<ReturnType<T1>> & ItemRecord<ReturnType<T2>> {
  return null as any;
}

const item1 = item('a', 123);

const composed = composeReverse([
  () => item1, //breakme
  ctx => item('b', ctx.a),
]);

composed.z;
