import { ILogger } from '@roro/s-middleware';

export class Logger implements ILogger {
  info(message) {
    console.log(message);
  }
}
