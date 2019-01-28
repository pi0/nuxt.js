import esm from 'esm'

const _esm = esm(module.parent)

export function importESM(path) {
  const m = _esm(path)
  return m.default || m
}
