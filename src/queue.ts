interface FetchQueueConfig {
  concurrency?: number
}

interface IFetchQueue {
  config: FetchQueueConfig;
  eventStatus: EventStatus;
}

type EventStatus = 'pending' | 'executing'
type Queue = () => Promise<void>


function initalize(fetchQueue: IFetchQueue, config: FetchQueueConfig) {
  fetchQueue.eventStatus = 'pending'
  fetchQueue.config = {
    concurrency: Infinity,
    ...config,
  }
}

export function FetchQueue(this: IFetchQueue, config: FetchQueueConfig) {
  initalize(this, config)

  const queues: Queue[] = []

  const event = (async function* () {
    let queue: Queue | undefined = undefined
    while ((queue = queues.pop()) !== undefined) {
      await queue()
      yield
    }
  })()

  const execute = async () => {
    if (this.eventStatus !== 'pending') return
    this.eventStatus = 'executing'
    for await (const _ of event) {} // eslint-disable-line no-empty
    this.eventStatus = 'pending'
  }

  return (input: RequestInfo | URL, init?: RequestInit | undefined) => {
    return new Promise<Response>((resolve, reject) => {
      queues.push(() => {
        return fetch(input, init)
          .then(resolve)
          .catch(reject)
      })
      execute()
    })
  }
}
