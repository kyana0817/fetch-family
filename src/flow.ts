interface FetchQueueConfig {
  concurrency?: number
}

interface FetchQueueContext {
  config: FetchQueueConfig;
  eventStatus: EventStatus;
  queues: Queue[];
}

type EventStatus = 'pending' | 'executing'
type Queue = () => Promise<void>


function initializer
(config: FetchQueueConfig): FetchQueueContext {
  return {
    eventStatus: 'pending',
    queues: [],
    config: {
      concurrency: Infinity,
      ...config, 
    }
  }
}

type CreateFetchQueueFn = (config?: FetchQueueConfig)
  => (input: RequestInfo | URL, init?: RequestInit | undefined)
  => Promise<Response>

export const createFetchQueue: CreateFetchQueueFn = function (userConfig = {}) {
  const ctx = initializer(userConfig)

  const event = (async function* () {
    let queue: Queue | undefined = undefined
    while ((queue = ctx.queues.pop()) !== undefined) {
      yield await queue()
    }
    return
  })

  const execute = async () => {
    if (ctx.eventStatus === 'executing') return
    ctx.eventStatus = 'executing'
    for await (const _ of event()) {} // eslint-disable-line no-empty
    ctx.eventStatus = 'pending'
  }

  return (input: RequestInfo | URL, init?: RequestInit | undefined) => {
    return new Promise<Response>((resolve, reject) => {
      ctx.queues.push(() => {
        return fetch(input, init)
          .then(resolve)
          .catch(reject)
      })
      execute()
    })
  }
}
