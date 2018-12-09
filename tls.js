const a = 1;

if (!process.addAsyncListener) require('async-listener');


process.addAsyncListener({
    create: () => namespace.active,
    before: (context, storage) => {
        if (storage) {
            namespace.active = storage;
        }
    },
    after: (context, storage) => {
        if (storage) {
            namespace.active = {};
        }
    }
});

const namespace = {
    active: {},
    set: (key, val) => {
        namespace.active[key] = val;
    },
    get: (key) => namespace.active[key]
};
