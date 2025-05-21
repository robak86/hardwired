import { BoxedValue } from '../../__test__/BoxedValue.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import { container } from '../../container/Container.js';
import { cascading } from '../def-symbol.js';

describe(`cascading definition`, () => {
  const numDefCascading = cascading<BoxedValue<number>>('num');
  const strDefCascading = cascading<BoxedValue<string>>('str');

  const myClassCascading = cascading<MyClass>('MyClassCascading');

  class MyClass {
    readonly value = Math.random();

    constructor(
      public readonly num: BoxedValue<number>,
      public readonly str: BoxedValue<string>,
    ) {}
  }

  const syncConfig = configureContainer(c => {
    c.add(numDefCascading).fn(() => new BoxedValue(123));
    c.add(strDefCascading).fn(() => new BoxedValue('123'));

    c.add(myClassCascading).class(MyClass, numDefCascading, strDefCascading);
  });

  describe(`own configured`, () => {
    it(`allows configuring the `, async () => {
      const cnt = container.new(syncConfig);

      const scope1 = cnt.scope(c =>
        c.modify(numDefCascading).configure(b => {
          b.value = 1;
        }),
      );

      const scope2 = cnt.scope(c =>
        c.modify(numDefCascading).configure(b => {
          b.value = 2;
        }),
      );

      const scope3 = cnt.scope(c =>
        c.modify(numDefCascading).configure(b => {
          b.value = 3;
        }),
      );

      expect((await scope3.use(numDefCascading)).value).toEqual(3);
      expect((await scope2.use(numDefCascading)).value).toEqual(2);
      expect((await scope1.use(numDefCascading)).value).toEqual(1);
    });
  });
});
