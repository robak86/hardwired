
process.addAsyncListener({
    create: () => threadLocals.current,
    before: (context, storage) => {
        if (storage) {
            threadLocals.current = storage;
        }
    },
    after: (context, storage) => {
        if (storage) {
            threadLocals.current = {};
        }
    }
});