import { getCommands } from './command.js'
import { getVersions, loadVersions } from './versions.js'
import { node } from './node/main.js'

const RUNNERS = { node }

// Import all available runners, as defined by the `run` option.
// Associate each runner option with its runner as well.
export const loadRunners = async function(runOpts) {
  const promises = Object.entries(runOpts).map(loadRunner)
  const runners = await Promise.all(promises)

  const versions = loadVersions(runners)
  return { runners, versions }
}

const loadRunner = async function([runnerId, runOpt]) {
  const runner = await importRunner(runnerId)

  const action = await fireAction(runner, runOpt)

  const commands = getCommands(action)

  const versions = await getVersions(action)

  return { commands, versions, extensions: runner.extensions }
}

const importRunner = function(runnerId) {
  const runner = RUNNERS[runnerId]

  if (runner !== undefined) {
    return runner
  }

  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(runnerId)
  } catch (error) {
    throw new Error(`Could not load runner '${runnerId}'\n\n${error.stack}`)
  }
}

// Fire runner `action()`
const fireAction = async function(
  { id: runnerId, title: runnerTitle, action },
  runOpt,
) {
  const { commands, versions } = await action(runOpt)
  return { runnerId, runnerTitle, runOpt, commands, versions }
}
