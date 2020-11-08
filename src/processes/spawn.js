import execa from 'execa'

import { getTimeout } from './timeout.js'

// Spawn runner's child process
export const spawnChild = async function ({
  commandSpawn: [file, ...args],
  commandSpawnOptions,
  eventPayload,
  duration,
  cwd,
  type,
}) {
  const eventPayloadStr = JSON.stringify(eventPayload)
  const spawnOptions = getSpawnOptions({
    commandSpawnOptions,
    duration,
    cwd,
    type,
  })
  const { message, failed, timedOut } = await execa(
    file,
    [...args, eventPayloadStr],
    spawnOptions,
  )
  return { message, failed, timedOut }
}

// Our spawn options have priority over commands spawn options.
const getSpawnOptions = function ({
  commandSpawnOptions,
  duration,
  cwd,
  type,
}) {
  const stdio = STDIO[type]
  const timeout = getTimeout(duration)
  return {
    ...commandSpawnOptions,
    stdio,
    cwd,
    timeout,
    maxBuffer: MAX_BUFFER,
    reject: false,
    preferLocal: true,
  }
}

// For IPC (success and error output), we use a file instead of:
//  - stdout/stderr: they are likely be used by the benchmarking code itself
//  - `child_process` `ipc`: would not work across programming languages
// stdout/stderr are:
//  - ignored in `run`
//  - printed in `debug`
//  - not printed during load for both `run`/`debug`, unless an error happened
const STDIO = {
  loadRun: ['ignore', 'pipe', 'pipe'],
  loadDebug: ['ignore', 'pipe', 'pipe'],
  iterationRun: ['ignore', 'ignore', 'ignore'],
  iterationDebug: ['ignore', 'inherit', 'inherit'],
}
const MAX_BUFFER = 1e8