import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import { fetchFlowClient } from '../src'
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

    const data = await fetchFlow('100')
    expect(data)
      .toEqual({ input: '100' })
  })
  
  it('sequence', async () => {
    const arr = [...new Array(12)].map((_, idx) => String(idx))  
    for (let i = 0, len = arr.length; i < len; ++i) {
      expect(fetchFlow(arr[i])
        .then(data => data)).resolves.toEqual({ input: arr[i] })
    }
  })
})
