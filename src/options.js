export const getOpts = function(opts) {
  return { ...DEFAULT_OPTS, ...opts }
}

const DEFAULT_OPTS = {
  repeat: 1e3,
}
