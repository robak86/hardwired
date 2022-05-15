import { response } from '../../helpers/server/Response.js';

export const postJsonHandler = (parsedJson: object | null):any => {
  return response({ parsedJson });
};
