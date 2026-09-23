import { describe, expect, it } from 'vitest'

import { URI_Drift } from './drift'

describe('URI_Drift', () => {
  it('parses uuid userinfo and required query fields', () => {
    const uri =
      'drift://96c14cf1-5abe-4285-b43d-ed2753d7ee5f@example.com:28456?psk=aa&server-public-key=bb&max-pad=256&multiplex=true#us1'
    const p = URI_Drift(uri)
    expect(p.type).toBe('drift')
    expect(p.name).toBe('us1')
    expect(p.server).toBe('example.com')
    expect(p.port).toBe(28456)
    expect(p.uuid).toBe('96c14cf1-5abe-4285-b43d-ed2753d7ee5f')
    expect(p.psk).toBe('aa')
    expect(p['server-public-key']).toBe('bb')
    expect(p['max-pad']).toBe(256)
    expect(p.multiplex).toBe(true)
    expect(p.udp).toBe(true)
  })
})
