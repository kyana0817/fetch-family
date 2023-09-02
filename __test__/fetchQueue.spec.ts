import { randomInt } from 'crypto'
import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import { fetchQueueClient } from '../src/queue'
import type { Mock } from 'vitest'


global.fetch = vi.fn((input: RequestInfo | URL) => Promise.resolve({
  json: () => new Promise(resolve => {
    setTimeout(() => {
      resolve({ input })
    }, randomInt(3, 20))
  }),
})) as Mock  

const fetchQueue = fetchQueueClient()
describe('fetchQueue test', () => {
  it('fetching', async () => {
    const data = await fetchQueue('100', { convertType: 'json' })
    expect(data)
      .toEqual({ input: '100' })
  })
  it('sequence', async () => {
    const arr = [...new Array(10)].map((_, idx) => String(idx))

    for (let i = 0, len = arr.length; i < len; ++i) {
      const data = await fetchQueue(arr[i], { convertType: 'json' })
      expect(data)
        .toEqual({ input: arr[i] })
    }
  })
  it('sequence', async () => {
    const arr = [...new Array(10)].map((_, idx) => String(idx))

    for (let i = 0, len = arr.length; i < len; ++i) {
      const data = await fetchQueue(arr[i], { convertType: 'json' })
      expect(data)
        .toEqual({ input: arr[i] })
    }
  })
})
