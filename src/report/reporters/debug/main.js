import { cyan, yellow, dim } from 'chalk'

import { getFooter } from './footer.js'

// Debugging reporter only meant for development purpose
const report = function(
  { timestampPretty, job, systemPretty, iterations },
  { system, show, link },
) {
  const content = iterations.map(serializeIteration).join('\n')
  const footer = getFooter({
    timestampPretty,
    job,
    systemPretty,
    system,
    show,
    link,
  })
  return `\n${content}${footer}\n\n`
}

const serializeIteration = function({ name, stats, fastest }) {
  const fastestMark = fastest ? cyan.bold('*') : ' '
  const statsStr = serializeStats(stats)
  return ` ${fastestMark} ${name}  ${cyan.dim('|')}  ${statsStr}`
}

export const serializeStats = function(stats) {
  return STATS.map(({ name, shortName }) =>
    serializeStat(stats, name, shortName),
  ).join(dim(' | '))
}

const STATS = [
  { name: 'medianPretty', shortName: 'mdn' },
  { name: 'meanPretty', shortName: 'mea' },
  { name: 'minPretty', shortName: 'min' },
  { name: 'maxPretty', shortName: 'max' },
  { name: 'diffPretty', shortName: 'dif' },
  { name: 'limitPretty', shortName: 'lmt' },
  { name: 'deviationPretty', shortName: 'dev' },
  { name: 'variancePretty', shortName: 'vrc' },
  { name: 'countPretty', shortName: 'cnt' },
  { name: 'loopsPretty', shortName: 'lps' },
  { name: 'repeatPretty', shortName: 'rpt' },
  { name: 'processesPretty', shortName: 'prc' },
]

const serializeStat = function(stats, name, shortName) {
  const stat = stats[name]
  return `${shortName} ${yellow(stat)}`
}

export const debug = { report }
