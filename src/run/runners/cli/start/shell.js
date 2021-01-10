import { applyTemplate } from '../template.js'

// Retrieve the `shell` property which indicates whether to execute commands
// through a shell.
export const getShell = function (
  { shell = DEFAULT_SHELL, ...entries },
  variables,
) {
  if (typeof shell === 'boolean') {
    return { shell, entries }
  }

  // `shell` can contain variables, i.e. can be a string 'true' or 'false'
  const shellA = applyTemplate(shell, variables)
  const shellB = shellA === 'true'
  return { shell: shellB, entries }
}

// We default to `true` because many users would expect this. It only adds a
// very small amount of duration and lower precision.
// However it is less secure and less cross-platform, so we encourage using
// `false` instead.
const DEFAULT_SHELL = true
