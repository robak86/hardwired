export type Action<TActionType extends string> = {
  type: TActionType;
};

export type ActionWithPayload<TActionType extends string, TPayload> = Action<TActionType> & {
  payload: TPayload;
};

export type ActionCreator<TActionType extends string> = {
  // type: TActionType;
  (): Action<TActionType>;
};

export type ActionWithPayloadCreator<TActionType extends string, TPayload> = {
  (payload: TPayload): ActionWithPayload<TActionType, TPayload>;
  // type: TActionType;
};

export type ActionBuilder<TActionType extends string> = {
  (): Action<TActionType>;
  type: TActionType;
  withPayload: <TPayload>() => (payload: TPayload) => ActionWithPayload<TActionType, TPayload>;
};

export const action = <TActionType extends string, TPayload>(
  type: TActionType,
  payload?: TPayload,
): ActionBuilder<TActionType> => {
  return Object.assign(
    (): Action<TActionType> => {
      return {
        type,
      };
    },
    {
      type,
      withPayload: () => (payload: TPayload) => {
        return {
          type,
          payload,
        };
      },
    },
  ) as any;
};

const someActionCreator = action('SomeAction');
const other = action('asd').withPayload<{ a: 1 }>();

const zz = someActionCreator();
const zzz = other({ a: 1 });
