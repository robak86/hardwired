import { Lens } from './lens';

export type Path1<P1 extends string, T> = {
  [K in P1]: T;
};

export type Path2<P1 extends string, P2 extends string, T> = {
  [K in P1]: Path1<P2, T>;
};

export type Path3<P1 extends string, P2 extends string, P3 extends string, T> = {
  [K in P1]: Path2<P2, P3, T>;
};

export type Path4<P1 extends string, P2 extends string, P3 extends string, P4 extends string, T> = {
  [K in P1]: Path3<P2, P3, P4, T>;
};

export type Path5<P1 extends string, P2 extends string, P3 extends string, P4 extends string, P5 extends string, T> = {
  [K in P1]: Path4<P2, P3, P4, P5, T>;
};

export type FromPathFactory<TReturn> = {
  <TProp1 extends string>(path: [TProp1]): Lens<Path1<TProp1, TReturn>, TReturn>;

  <TProp1 extends string, TProp2 extends string>(path: [TProp1, TProp2]): Lens<Path2<TProp1, TProp2, TReturn>, TReturn>;

  <TProp1 extends string, TProp2 extends string, TProp3 extends string>(path: [TProp1, TProp2, TProp3]): Lens<
    Path3<TProp1, TProp2, TProp3, TReturn>,
    TReturn
  >;

  <TProp1 extends string, TProp2 extends string, TProp3 extends string, TProp4 extends string>(
    path: [TProp1, TProp2, TProp3, TProp4],
  ): Lens<Path4<TProp1, TProp2, TProp3, TProp4, TReturn>, TReturn>;

  <TProp1 extends string, TProp2 extends string, TProp3 extends string, TProp4 extends string, TProp5 extends string>(
    path: [TProp1, TProp2, TProp3, TProp4, TProp5],
  ): Lens<Path5<TProp1, TProp2, TProp3, TProp4, TProp5, TReturn>, TReturn>;
};
