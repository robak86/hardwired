import { response } from '../../helpers/server/Response';

export const postJsonHandler = (parsedJson: object | null) => {
  return response({ parsedJson });
};
