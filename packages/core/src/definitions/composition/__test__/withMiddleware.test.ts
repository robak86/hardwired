import { describe, vi } from 'vitest';

import type { IContainer } from '../../../container/IContainer.js';
import { createMiddleware, withMiddleware } from '../withMiddleware.js';
import { fn } from '../../fn.js';
import { once } from '../../../container/Container.js';

describe(`withMiddleware`, () => {
  class CreatingScopes {
    readonly containerIds: string[] = [];

    constructor() {}

    middleware = createMiddleware((locator: IContainer, next, ...args) => {
      const scope = locator.scope();

      this.containerIds.push(scope.id);

      return next(scope, ...args);
    });
  }

  function setup() {
    const passthrough = createMiddleware((locator, next, ...args) => {
      return next(locator, ...args);
    });

    const scopesMonitoring = new CreatingScopes();

    vi.spyOn(scopesMonitoring, 'middleware');

    return {
      passthrough: vi.fn(passthrough) as typeof passthrough,
      creatingScope: scopesMonitoring.middleware,
      createdContainersIds: scopesMonitoring.containerIds,
    };
  }

  describe(`combine without args`, () => {
    it(`returns correct instance`, async () => {
      const define = withMiddleware();

      const defWithMiddleware = define(() => 123);

      expect(once(defWithMiddleware)).toBe(123);
    });
  });

  describe(`passthrough`, () => {
    it(`returns correct instance`, async () => {
      const { passthrough } = setup();
      const define = withMiddleware(passthrough);

      const defWithMiddleware = define(() => 123);

      expect(once(defWithMiddleware)).toBe(123);
      expect(passthrough).toHaveBeenCalledTimes(1);
    });

    it(`returns correct instance for multiple middlewares`, async () => {
      const { passthrough } = setup();
      const define = withMiddleware(passthrough, passthrough, passthrough);

      const defWithMiddleware = define(() => 123);

      expect(once(defWithMiddleware)).toBe(123);
      expect(passthrough).toHaveBeenCalledTimes(3);
    });

    it(`works with args`, async () => {
      const { passthrough } = setup();
      const define = withMiddleware(passthrough, passthrough, passthrough);

      const withoutMiddleware = fn((use, arg1: number, arg2: string) => [arg1, arg2]);

      const withMiddlewareApplied = define((use, arg1: number, arg2: string) => [arg1, arg2]);

      expect(once(withMiddlewareApplied, 123, '123')).toEqual([123, '123']);
      expect(once(withoutMiddleware, 123, '123')).toEqual([123, '123']);
    });
  });

  describe(`creatingScope`, () => {
    it(`returns correct instance`, async () => {
      const { creatingScope } = setup();
      const define = withMiddleware(creatingScope);

      const randomScopedValue = fn.scoped(() => Math.random());
      const defWithMiddleware = define(use => use(randomScopedValue));

      const req1Value = once(defWithMiddleware);
      const req2Value = once(defWithMiddleware);

      expect(req1Value).not.toEqual(req2Value);
    });

    it(`returns correct instance for multiple middlewares`, async () => {
      const { creatingScope } = setup();
      const define = withMiddleware(creatingScope, creatingScope, creatingScope);

      const randomScopedValue = fn.scoped(() => Math.random());
      const defWithMiddleware = define(use => use(randomScopedValue));

      const req1Value = once(defWithMiddleware);
      const req2Value = once(defWithMiddleware);

      expect(req1Value).not.toEqual(req2Value);
    });

    it(`creates correct amount of containers`, async () => {
      const { creatingScope, createdContainersIds } = setup();
      const define = withMiddleware(creatingScope, creatingScope, creatingScope);

      const randomScopedValue = fn.scoped(() => Math.random());
      const defWithMiddleware = define(use => use(randomScopedValue));

      once(defWithMiddleware);

      expect(createdContainersIds.length).toBe(3);
      expect(createdContainersIds[0]).not.toEqual(createdContainersIds[1]);
      expect(createdContainersIds[1]).not.toEqual(createdContainersIds[2]);
    });
  });
});
