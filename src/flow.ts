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
  const event = (async function* () {
    let task: Queue | undefined = undefined
    
    while ((task = nextTask()) !== undefined) {
      const [size, queue] = task
      ctx.currentFetchSize -= size
      const itemId = ++processId
      ctx.currentProcesses.set(
        itemId,
        queue()
          .finally(() => {
            ctx.currentFetchSize += size
            ctx.currentProcesses.delete(itemId)
            ctx.eventStatus = ctx.currentProcesses.size > 0 ? 'executing': 'pending'
          }))
    }
    
    yield await Promise.any([...ctx.currentProcesses].map(([_, promise]) => promise))
  })

  const execute = async (isLoop = false) => {
    if (ctx.eventStatus === 'executing' && !isLoop) return
    ctx.eventStatus = 'executing'
    for await(const _ of event()) {} // eslint-disable-line no-empty
    execute(true)
  }

  return ({
    addQueue: (task: Queue) => {
      ctx.queues.set(++queueId, task)
    },
    execute
  })
}

const requestFn: RequestFn<FetchActions> = (actions) => 
  (input, init) => {
    return new Promise((resolve, reject) => {
      fetchSize(input, init)
        .then(size => {
          actions.addQueue([
            size,
            () => fetch(input, init)
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
