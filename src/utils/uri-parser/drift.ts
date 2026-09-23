import {
  decodeAndTrim,
  parseBoolOrPresence,
  parseInteger,
  parsePortOrDefault,
  parseQueryStringNormalized,
  parseUrlLike,
  safeDecodeURIComponent,
  stripUriScheme,
} from './helpers'

/**
 * Drift URI (Clash Verge Rev / mihomo-drift).
 *
 * drift://[uuid@]server:port?psk=<hex>&server-public-key=<hex>&max-pad=256&multiplex=true&udp=true#name
 *
 * Required query: psk, server-public-key
 * uuid may be in userinfo or ?uuid=
 */
export function URI_Drift(line: string): IProxyDriftConfig {
  const afterScheme = stripUriScheme(line, 'drift', 'Invalid drift uri')
  if (!afterScheme) {
    throw new Error('Invalid drift uri')
  }
  const {
    auth: authRaw,
    host: server,
    port,
    query: addons,
    fragment: nameRaw,
  } = parseUrlLike(afterScheme, {
    errorMessage: 'Invalid drift uri',
  })
  if (!server) {
    throw new Error('Invalid drift uri')
  }
  const portNum = parsePortOrDefault(port, 443)
  const params = parseQueryStringNormalized(addons)
  const uuidFromAuth = safeDecodeURIComponent(authRaw) ?? authRaw
  const uuid = params.uuid || uuidFromAuth || undefined
  const decodedName = decodeAndTrim(nameRaw)
  const name = decodedName ?? `Drift ${server}:${portNum}`

  const proxy: IProxyDriftConfig = {
    type: 'drift',
    name,
    server,
    port: portNum,
    udp: true,
    multiplex: true,
  }

  if (uuid) {
    proxy.uuid = uuid
  }
  if (params.psk) {
    proxy.psk = params.psk
  }
  const spk = params['server-public-key'] ?? params.spk ?? params.pubkey
  if (spk) {
    proxy['server-public-key'] = spk
  }
  const maxPad = parseInteger(params['max-pad'] ?? params.maxpad)
  if (maxPad !== undefined) {
    proxy['max-pad'] = maxPad
  }
  const dataPad = parseInteger(params['data-pad'] ?? params.datapad)
  if (dataPad !== undefined) {
    proxy['data-pad'] = dataPad
  }
  if (Object.prototype.hasOwnProperty.call(params, 'multiplex')) {
    proxy.multiplex = parseBoolOrPresence(params.multiplex)
  }
  if (Object.prototype.hasOwnProperty.call(params, 'udp')) {
    proxy.udp = parseBoolOrPresence(params.udp)
  }

  return proxy
}
