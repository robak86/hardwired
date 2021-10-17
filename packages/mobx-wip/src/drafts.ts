import { singleton, container, decorate } from 'hardwired';

interface IWriter {
    write(data);
}

class Writer implements IWriter {
    write(data) {}
}

class Logger {
    info(msg) {}
}

class LoggingWriter implements IWriter {
    constructor(private writer, private logger: Logger) {}

    write(data) {
        this.logger.info('Writting data');
        this.writer.write(data);
        this.logger.info('Done');
    }
}

const writerDef = singleton.class(Writer);
const loggerDef = singleton.class(Logger);

const writerOverrideDef = decorate(
    writerDef,
    (originalWriter, logger) => new LoggingWriter(originalWriter, logger),
    loggerDef, // inject extra dependency required by LoggingWriter
);

const cnt = container([writerOverrideDef]);

cnt.get(writerDef); // returns instance if LoggingWriter
