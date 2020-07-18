import * as http2 from 'http2';
// import * as fs from 'fs';
// import * as path from 'path';
// import { HttpRequest } from './HttpRequest';
// import { HttpResponse } from './HttpResponse';
//
// // TODO: server should encapsulate httpRequest and httpResponse details. Other packages shouldn't know about the server
// // implementation details, because we would need to be able to switch to http1/http2 etc
//
// export type ServerConfiguration = {
//   port?: number;
//   app: (requestContext: HttpRequest) => Promise<HttpResponse<any>> | HttpResponse<any>;
// };
//
// export type ServerInstance = {
//   listen(): Promise<void>;
// };
//
// // export type HttpPipe = Pipe<HttpRequestContext, HttpResponseContext, HttpServerError>;
// //
// // export const httpPipe = pipe<HttpRequestContext, HttpServerError>();
//
// export function createServer(config: ServerConfiguration): ServerInstance {
//   const keyPath = path.resolve(__dirname, '../../../cert/localhost-privkey.pem');
//   const cert = path.resolve(__dirname, '../../../cert/localhost-cert.pem');
//
//   const server = http2.createSecureServer({
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(cert),
//   });
//   server.on('error', err => console.error(err));
//
//   server.on('session', session => {
//     console.log('session');
//     console.log(session);
//
//     session.once('close', arg => {
//       console.log('session close', arg, session);
//     });
//
//     session.once('goaway', arg => {
//       console.log('session goaway', arg, session);
//     });
//
//     session.once('timeout', arg => {
//       console.log('session timeout', arg, session);
//     });
//   });
//
//   server.on('stream', (stream, headers) => {
//     const httpPipe2 = Promise.resolve(config.app({ stream, headers })).then((response: HttpResponse<any>) =>
//       console.log('done'),
//     );
//
//     console.log(headers);
//     // stream is a Duplex
//
//     stream.respond({
//       'content-type': 'application/json',
//       ':status': 200,
//       'Access-Control-Allow-Origin': '*',
//     });
//     stream.end(JSON.stringify({ hello: true }));
//   });
//
//   return {
//     listen: () => {
//       server.listen(config.port);
//       return Promise.resolve();
//     },
//   };
// }
