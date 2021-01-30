import now from 'performance-now';
import { Container, container } from '../container/Container';
import { ModuleBuilder, unit } from '../module/ModuleBuilder';
import { value } from '../resolvers/ValueResolver';

describe(`performance`, () => {
  function registerN(times: number) {
    const result = {
      container: container(),
      register: -1,
      module: unit('flatModule'),
    };

    for (let i = 0; i < times; i++) {
      const start = now();
      result.module = result.module.define(`SOME_ID_${i}`, value({ test: 1 }));
      const end = now();
      result.register = end - start;
    }

    return result;
  }

  function resolveN(container: Container, module: ModuleBuilder<any>, times: number) {
    const result = {
      avg: -1,
      max: -1,
      min: 9999999999999999,
    };

    const items: number[] = [];
    let i = 0;

    for (i = 0; i < times; i++) {
      const start = now();
      container.get(module, `SOME_ID_${times}` as any);
      const end = now();
      const total = end - start;

      if (total < result.min) {
        result.min = total;
      }
      if (total > result.max) {
        result.max = total;
      }

      items.push(total);
    }

    result.avg = items.reduce((p, c) => p + c, 0) / items.length;

    return result;
  }

  it('appends 1 new definition in less than 1 ms', () => {
    const result1 = registerN(1);
    expect(result1.register).toBeLessThan(1);
  });

  it('appends 5 new definitions in less than 1 ms', () => {
    const result5 = registerN(5);
    expect(result5.register).toBeLessThan(1);
  });

  it('appends 1K new definitions in less than 1 ms', () => {
    const result1K = registerN(1000);
    expect(result1K.register).toBeLessThan(1);
  });

  it('appends 5K new definitions in less than 2 ms', () => {
    const result5K = registerN(5000);
    console.log(result5K.register);
    expect(result5K.register).toBeLessThan(2);
  });

  it('Should be able to register 1 bindings in less than 1 ms', () => {
    const { module } = registerN(1000);
    const c = container();
    const result1 = resolveN(c, module, 5);
    expect(result1.avg).toBeLessThan(1);
  });

  it('Should be able to register 5 bindings in less than 1 ms', () => {
    const { module } = registerN(1000);
    const c = container();
    const result5 = resolveN(c, module, 5);
    expect(result5.avg).toBeLessThan(1);
  });

  it('Should be able to register 1K bindings in less than 1 ms', () => {
    const { module } = registerN(1000);
    const c = container();
    const result1K = resolveN(c, module, 5);
    expect(result1K.avg).toBeLessThan(1);
  });

  it('Should be able to register 5K bindings in less than 1 ms', () => {
    const { module } = registerN(5000);
    const c = container();
    const result5K = resolveN(c, module, 5);
    expect(result5K.avg).toBeLessThan(1);
  });

  it('Should be able to register 10K bindings in less than 1 ms', () => {
    const { module } = registerN(10000);
    const c = container();
    const result10K = resolveN(c, module, 5);
    expect(result10K.avg).toBeLessThan(1);
  });
});
