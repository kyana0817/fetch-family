"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFlowClient = void 0;
const base_1 = require("./base");
const fetchSize = async (input, init = {}) => {
    return await fetch(input, {
        ...init,
        method: 'HEAD',
    })
        .then(data => parseInt(data.headers.get('Content-Length') ?? '0'));
};
const initializer = (config = {}) => ({
    eventStatus: 'pending',
    currentFetchSize: 0,
    currentProcesses: new Map(),
    queues: new Map(),
    config: {
        sizeLimit: Infinity,
        ...config
    }
});
const createActions = (ctx) => {
    let queueId = 0;
    let processId = 0;
    const isExecutable = (size) => {
        return (ctx.config.sizeLimit - ctx.currentFetchSize) >= size;
    };
    const nextTask = () => {
        for (const [id, queue] of ctx.queues) {
            if (!isExecutable(queue[0]))
                continue;
            ctx.queues.delete(id);
            return queue;
        }
        return undefined;
    };
    const event = async () => {
        let task = undefined;
        while (ctx.eventStatus === 'executing') {
            while ((task = nextTask()) !== undefined) {
                const [size, queue] = task;
                ctx.currentFetchSize += size;
                const itemId = ++processId;
                ctx.currentProcesses.set(itemId, queue()
                    .finally(() => {
                    ctx.currentFetchSize -= size;
                    ctx.currentProcesses.delete(itemId);
                    ctx.eventStatus = ctx.currentProcesses.size + ctx.queues.size > 0 ? 'executing' : 'pending';
                }));
            }
            await Promise.any([...ctx.currentProcesses].map(([_, promise]) => promise));
        }
        return;
    };
    return ({
        addQueue: (task) => {
            ctx.queues.set(++queueId, task);
        },
        execute: async () => {
            if (ctx.eventStatus === 'executing')
                return;
            ctx.eventStatus = 'executing';
            event();
        }
    });
};
const requestFn = (actions) => (input, init = {}) => {
    return new Promise((resolve, reject) => {
        const { convertType = 'json', ...options } = init;
        fetchSize(input, options)
            .then(size => {
            actions.addQueue([
                size,
                () => fetch(input, options)
                    .then(res => res[convertType]())
                    .then(resolve)
                    .catch(reject)
            ]);
            actions.execute();
        });
    });
};
exports.fetchFlowClient = (0, base_1.createClient)({
    initializer,
    createActions,
    requestFn
});
