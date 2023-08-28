import { createClient } from './base'
import type { RequestFn } from './base'


type EventStatus = 'pending' | 'executing'
type Process = () => Promise<void>
type Queue = [number, Process]

type FetchFlowConfig = {
  sizeLimit?: number;
}

type FetchFlowContext = {
  eventStatus: EventStatus;
  currentFetchSize: number;
  currentProcesses: Map<number, Promise<void>>;
  queues: Map<number, Queue>
  config: Readonly<Required<FetchFlowConfig>>
}

type FetchActions = ReturnType<typeof createActions>

const fetchSize = async (input: RequestInfo | URL, init: RequestInit | undefined = {}) => {
  return await fetch(input, {
    ...init,
    method: 'HEAD',
  })
    .then(data => parseInt(data.headers.get('Content-Length') ?? '0'))
}

const initializer = (config: FetchFlowConfig = {}): FetchFlowContext => ({
  eventStatus: 'pending',
  currentFetchSize: 0,
  currentProcesses: new Map(),
  queues: new Map(),
  config: {
    sizeLimit: Infinity,
    ...config
  }
})

const createActions = (ctx: FetchFlowContext) => {
  let queueId = 0
  let processId = 0

  const isExecutable = (size: number) => {
    return (ctx.config.sizeLimit - ctx.currentFetchSize) >= size
  }

  const nextTask = () => {
    for (const [id, queue] of ctx.queues) {
      if (!isExecutable(queue[0])) continue
      ctx.queues.delete(id)
      return queue
    }
    return undefined
  }
  const event = async () => {
    let task: Queue | undefined = undefined
    while (ctx.eventStatus === 'executing') {
      while ((task = nextTask()) !== undefined) {
        const [size, queue] = task
        ctx.currentFetchSize += size
        const itemId = ++processId
        ctx.currentProcesses.set(
          itemId,
          queue()
            .finally(() => {
              ctx.currentFetchSize -= size
              ctx.currentProcesses.delete(itemId)
              ctx.eventStatus = ctx.currentProcesses.size + ctx.queues.size > 0 ? 'executing': 'pending'
            }))
      }
      await Promise.any([...ctx.currentProcesses].map(([_, promise]) => promise))
    }
    return
  }

  return ({
    addQueue: (task: Queue) => {
      ctx.queues.set(++queueId, task)
    },
    execute: async () => {
      if (ctx.eventStatus === 'executing') return
      ctx.eventStatus = 'executing'
      event()
    }
  })
}

const requestFn: RequestFn<FetchActions> = (actions) => 
  (input, init={}) => {
    return new Promise((resolve, reject) => {
      const {
        convertType='json', ...options 
      } = init
      fetchSize(input, options)
        .then(size => {
          actions.addQueue([
            size,
            () => fetch(input, options)
              .then(res => res[convertType]())
              .then(resolve)
              .catch(reject)
          ])
          actions.execute()
        })
    })}
  
export const fetchFlowClient = createClient({
  initializer,
  createActions,
  requestFn
})
