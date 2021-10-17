import { IncomingMessage } from 'http';

export const jsonParams = async (req: IncomingMessage): Promise<object | null> => {
  const buffers: any[] = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const data = Buffer.concat(buffers).toString();

  try {
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};
