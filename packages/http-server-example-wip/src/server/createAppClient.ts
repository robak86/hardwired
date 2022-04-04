import fetch, { RequestInit } from 'node-fetch';
import urljoin from 'url-join';
import { ServerInstance } from '../helpers/server/startServer';

export const buildServerFetch = (server: ServerInstance) => (relativeUrl: string, init?: RequestInit) => {
  const port = server.port;
  return fetch(urljoin(`http://localhost:${port}/`, relativeUrl), init);
};
