import { response } from '../../helpers/server/Response';

export const helloWorldHandler = () => {
  return response({ msg: 'Hello world', id: Math.random() });
};
