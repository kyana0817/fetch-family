import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import { fetchFlowClient } from '../src/flow'
import type { Mock } from 'vitest'


global.fetch = vi.fn((input: RequestInfo | URL) => Promise.resolve({
  headers: {
    get: (_: string) => '500'
  },
  json: () => Promise.resolve({ input })
})) as Mock

const fetchFlow = fetchFlowClient({ sizeLimit: 1024 })

describe('fetchFlow test', () => {
  it('fetching', async () => {

    const res = await fetchFlow('100')
    expect(await res.json())
      .toEqual({ input: '100' })
  })
  
  it('sequence', async () => {
    const arr = [...new Array(12)].map((_, idx) => String(idx))
    const promises: Promise<any>[]  = []
  
    for (let i = 0, len = arr.length; i < len; ++i) {
      promises.push(fetchFlow(arr[i])
        .then(res => res.json())
        .then(data => expect(data)
          .toEqual({ input: arr[i] })))
    }
    await Promise.all(promises)
  })
})
