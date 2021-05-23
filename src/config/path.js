import { resolve } from 'path'

import mapObj from 'map-obj'

// Resolve configuration relative file paths to absolute paths
// When resolving configuration relative file paths:
//   - The CLI and programmatic flags always use the current directory.
//      - The `cwd` configuration property is not used since it might be
//        confusing:
//         - `cwd` flag would be relative to the current directory while other
//           flags would be relative to the `cwd` flag
//         - while the `cwd` flag would impact other flags, `cwd` in `spyd.*`
//           would not
//   - The files in `spyd.*` use the configuration file's directory instead.
//      - We do this since this is what most users would expect.
// In contrast, the `cwd` flag:
//   - is used for:
//      - file searches:
//         - `config` flag default value
//         - `tasks` flag default value
//         - `.git` directory
//      - child process execution:
//         - runner process
//   - defaults to the current directory
//   - reasons:
//      - This is what most users would expect
//      - This allows users to change cwd to modify the behavior of those file
//        searches and processes
//         - For example, a task using a file or using the current git
//           repository could be re-used for different cwd
//   - user can opt-out of that behavior by using absolute file paths, for
//     example using the current file's path (e.g. `__filename|__dirname`)
export const setConfigAbsolutePaths = function ({ configContents, base }) {
  return mapObj(configContents, (propName, value) => [
    propName,
    setConfigAbsolutePath(propName, value, base),
  ])
}

// Resolve all file path configuration properties.
// Done recursively since some are objects.
const setConfigAbsolutePath = function (propName, value, base) {
  if (!PATH_CONFIG_PROPS.has(propName) || !isDefinedPath(value)) {
    return value
  }

  return resolve(base, value)
}

const PATH_CONFIG_PROPS = new Set(['cwd', 'output', 'tasks'])

const isDefinedPath = function (value) {
  return typeof value === 'string' && value.trim() !== ''
}
