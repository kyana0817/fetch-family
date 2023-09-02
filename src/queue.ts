import { createClient } from './base'
import type { RequestFn } from './base'


type FetchQueueConfig = {
  concurrency?: number;
}

type FetchQueueContext = {
  eventStatus: EventStatus;
  queues: Queue[];
  config: Readonly<Required<FetchQueueConfig>>;
}

type FetchActions = ReturnType<typeof createActions>

type EventStatus = 'new-item' | 'pending' | 'executing'
type Queue = () => Promise<void>

const initializer = (config: FetchQueueConfig = {}): FetchQueueContext => ({
  eventStatus: 'pending',
  queues: [],
  config: {
    concurrency: Infinity,
    ...config, 
  }
})

const createActions = (ctx: FetchQueueContext) => {
  const event = (async function* () {
    let queue: Queue | undefined = undefined
    while ((queue = ctx.queues.shift()) !== undefined) {
      yield await queue()
        .finally(() => {console.log('hello')})
    }
    return
  })

  return ({
    addQueue: (task: Queue) => {
      if (ctx.eventStatus !== 'executing') {
        ctx.eventStatus = 'new-item'
      }
      ctx.queues.push(task)        
    },
    execute: async () => {
      if (ctx.eventStatus === 'executing') return
      ctx.eventStatus = 'executing'
      for await (const _ of event()) {} // eslint-disable-line no-empty
      ctx.eventStatus = 'pending'
    }
  })
}

const requestFn: RequestFn<FetchActions> = (actions) =>
  (input, init={}) => new Promise((resolve, reject) => {
    const {
      convertType='json', ...options 
    } = init
    actions.addQueue(async () => {
      await fetch(input, options)
        .then(res => res[convertType]())
        .then(resolve)
        .catch(reject)
    })
    actions.execute()
  })


export const fetchQueueClient = createClient({
  initializer,
  createActions,
  requestFn
})
