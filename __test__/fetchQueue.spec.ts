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
    const res = await fetchQueue('100')
    expect(await res.json())
      .toEqual({ input: '100' })
  })
  it('sequence', async () => {
    const arr = [...new Array(10)].map((_, idx) => String(idx))

    for (let i = 0, len = arr.length; i < len; ++i) {
      const res = await fetchQueue(arr[i])
      expect(await res.json())
        .toEqual({ input: arr[i] })
    }
  })
  it('sequence', async () => {
    const arr = [...new Array(10)].map((_, idx) => String(idx))

    for (let i = 0, len = arr.length; i < len; ++i) {
      fetchQueue(arr[i])
        .then(res => res.json())
        .then(data => {
          expect(data)
            .toEqual({ input: arr[i] })
        })
    }
  })
})
