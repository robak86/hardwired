import { response } from '../../helpers/server/Response.js';

export const helloWorldHandler = () => {
  return response({ msg: 'Hello world', id: Math.random() });
};
