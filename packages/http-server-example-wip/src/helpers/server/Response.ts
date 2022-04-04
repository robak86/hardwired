import { ServerResponse } from 'http';

export type ResponseEffect = {
  status: number;
  data: any;
};

export const response = (data: any, status = 200): ResponseEffect => {
  return {
    data,
    status,
  };
};

export class ResponseInterpreter {
  onResponse(response: ResponseEffect, res: ServerResponse) {
    res.statusCode = response.status;
    res.end(JSON.stringify(response.data));
  }
}
