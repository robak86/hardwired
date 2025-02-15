import { describe, it, expect } from 'vitest';
import { getTruncatedFunctionDefinition } from '../getTruncatedFunctionDefinition.js';

describe('getTruncatedFunctionDefinition', () => {
  it('should handle named function', () => {
    const exampleFunc = function example(a:any, b:any) {
      if (a > b) {
        return a;
      } else {
        return b;
      }
    };
    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toBe(
      'function example(a, b) { ... return a; ... return b; }',
    );
  });

  it(`correctly handles the return of single line fat arrow function`, async () => {
    const exampleFunc = (a: any, b: any) => 123;

    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toBe('(a, b) => 123');
  });

  it(`returns correct value for empty body for fat arrow function`, async () => {
    const exampleFunc = (a: any, b: any) => {};

    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toEqual('(a, b) => {\n    }');
  });

  it('should handle named function', () => {
    const exampleFunc = function example(a: any, b: any, c: any) {
      if (a > b) {
        return a;
      }

      if (a > c) {
        return c;
      }

      return b;
    };
    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toBe(
      'function example(a, b, c) { ... return a; ... return c; ... return b; }',
    );
  });

  it('should handle unnamed function', () => {
    const exampleFunc = function (a: any, b: any) {
      if (a > b) {
        return a;
      } else {
        return b;
      }
    };
    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toBe(
      'function (a, b) { ... return a; ... return b; }',
    );
  });

  it('should handle arrow function', () => {
    const exampleFunc = (a: any, b: any) => {
      if (a > b) {
        return a;
      } else {
        return b;
      }
    };
    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toBe('(a, b) => { ... return a; ... return b; }');
  });

  it('should handle async arrow function', () => {
    const exampleFunc = async (a: any, b: any) => {
      if (a > b) {
        return a;
      } else {
        return b;
      }
    };
    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toBe(
      'async (a, b) => { ... return a; ... return b; }',
    );
  });

  it('should handle async arrow function v2', () => {
    const exampleFunc = async (a: any, b: any) => {
      if (a > b) {
        return a;
      }

      return b;
    };
    expect(getTruncatedFunctionDefinition(exampleFunc.toString())).toBe(
      'async (a, b) => { ... return a; ... return b; }',
    );
  });

  it('should handle method shorthand', () => {
    const obj = {
      example(a: any, b: any) {
        if (a > b) {
          return a;
        } else {
          return b;
        }
      },
    };
    expect(getTruncatedFunctionDefinition(obj.example.toString())).toBe(
      'example(a, b) { ... return a; ... return b; }',
    );
  });
});
