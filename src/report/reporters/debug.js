// Debugging reporter only meant for development purpose
const main = function({ iterations, printedSystem }, { link, system }) {
  const content = iterations.map(serializeIteration).join('\n')
  const contentA = addSystem(content, system, printedSystem)
  const contentB = addLink(contentA, link)
  return contentB
}

const serializeIteration = function({ name, printedStats, fastest }) {
  const fastestMark = fastest ? '*' : ' '
  const statsStr = serializeStats(printedStats)
  return `${fastestMark} ${name} | ${statsStr}`
}

export const serializeStats = function(printedStats) {
  return Object.entries(printedStats)
    .filter(shouldPrintStat)
    .map(serializeStat)
    .join(' | ')
}

const shouldPrintStat = function([name]) {
  return !NON_PRINTED_STATS.includes(name)
}

const NON_PRINTED_STATS = ['percentiles', 'histogram']

const serializeStat = function([name, string]) {
  return `${name} ${string}`
}

const addSystem = function(content, system, printedSystem) {
  if (!system) {
    return content
  }

  return `${content}\n\n${printedSystem}`
}

const addLink = function(content, link) {
  if (!link) {
    return content
  }

  return `${content}\n\nBenchmarked with spyd (https://github.com/ehmicky/spyd)`
}

export const debug = { main }
