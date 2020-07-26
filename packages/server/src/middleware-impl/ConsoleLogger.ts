import { ILogger } from '@roro/s-middleware';

export class ConsoleLogger implements ILogger {
  info(message) {
    console.info(message);
  }
}
