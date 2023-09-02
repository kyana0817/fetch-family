import { createClient } from './base';
const initializer = (config = {}) => ({
    eventStatus: 'pending',
    queues: [],
    config: {
        concurrency: Infinity,
        ...config,
    }
});
const createActions = (ctx) => {
    const event = (async function* () {
        let queue = undefined;
        while ((queue = ctx.queues.shift()) !== undefined) {
            yield await queue()
                .finally(() => { console.log('hello'); });
        }
        return;
    });
    return ({
        addQueue: (task) => {
            if (ctx.eventStatus !== 'executing') {
                ctx.eventStatus = 'new-item';
            }
            ctx.queues.push(task);
        },
        execute: async () => {
            if (ctx.eventStatus === 'executing')
                return;
            ctx.eventStatus = 'executing';
            for await (const _ of event()) { }
            ctx.eventStatus = 'pending';
        }
    });
};
const requestFn = (actions) => (input, init = {}) => new Promise((resolve, reject) => {
    const { convertType = 'json', ...options } = init;
    actions.addQueue(async () => {
        await fetch(input, options)
            .then(res => res[convertType]())
            .then(resolve)
            .catch(reject);
    });
    actions.execute();
});
export const fetchQueueClient = createClient({
    initializer,
    createActions,
    requestFn
});
