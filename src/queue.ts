import { createClient } from './base'


type FetchQueueConfig = {
  concurrency?: number;
}

type FetchQueueContext = {
  eventStatus: EventStatus;
  queues: Queue[];
  config: FetchQueueConfig;
}

type EventStatus = 'pending' | 'executing'
type Queue = () => Promise<void>


export const fetchQueueClient = createClient({
  initializer: (config: FetchQueueConfig = {}): FetchQueueContext => ({
    eventStatus: 'pending',
    queues: [],
    config: {
      concurrency: Infinity,
      ...config, 
    }
  }),
  createMethods: (ctx) => {
    const event = (async function* () {
      let queue: Queue | undefined = undefined
      while ((queue = ctx.queues.pop()) !== undefined) {
        yield await queue()
      }
      return
    })

    return ({
      addQueue: (task: Queue) => {
        ctx.queues.push(task)        
      },
      execute: async () => {
        if (ctx.eventStatus === 'executing') return
        ctx.eventStatus = 'executing'
        for await (const _ of event()) {} // eslint-disable-line no-empty
        ctx.eventStatus = 'pending'
      }
    })},
  requestFn: (methods) => (input, init) => new Promise((resolve, reject) => {
    methods.addQueue(async () => {
      fetch(input, init)
        .then(resolve)
        .catch(reject)
    })
    methods.execute()
  })
})
