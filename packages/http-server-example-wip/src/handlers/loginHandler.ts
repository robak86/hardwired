import { ServerResponse } from 'http';

type LoginParams = {
  email: string;
  password: string;
};

export const loginParams = async (params: object | null): Promise<LoginParams | null> => {
  return params as LoginParams;
};

export const loginHandler = async (loginParams: LoginParams | null, res: ServerResponse) => {
  if (loginParams?.password === 'top-secret') {
    res.end(JSON.stringify({ message: 'ok' }));
  }
};
