const invariant = (shouldBeTrue: boolean, message: string) => {
  if (!shouldBeTrue) {
    throw new Error(message);
  }
};

const assoc = (prop: string, val, obj) => {
  return {
    ...obj,
    [prop]: val,
  };
};

export const get = (path: string[]) => defaultValue => fromObj => {
  let currentObj = fromObj;

  for (const prop of path) {
    const propValue = currentObj?.[prop];

    if (!propValue && propValue !== 0) {
      return defaultValue;
    }

    currentObj = currentObj[prop];
  }

  return currentObj;
};

export const write = <TValue>(path: string[]) => (value: TValue) => <TFrom>(fromObj: TFrom): TFrom => {
  if (path.length === 0) {
    return fromObj;
  }

  const [current, ...rest] = path;

  if (path.length === 1) {
    return assoc(current, value, fromObj);
  } else {
    assertWritable(fromObj?.[current], current);

    const nextObj = fromObj[current] === undefined ? {} : fromObj[current];
    return assoc(current, write(rest)(value)(nextObj), fromObj);
  }
};

function assertWritable(obj, currentPathFragment: string) {
  invariant(obj !== null, `Cannot assign an object to property ${currentPathFragment} set to null`);
  invariant(!Array.isArray(obj), `Cannot assign an object to property ${currentPathFragment} set to an array`);

  invariant(typeof obj !== 'number', `Cannot assign an object to property ${currentPathFragment} set to a number`);
  invariant(typeof obj !== 'string', `Cannot assign an object to property ${currentPathFragment} set to a string`);
}
