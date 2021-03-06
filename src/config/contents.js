import { extname } from 'path'

import { UserError } from '../error/main.js'
import { importJsDefault } from '../utils/import.js'
import { loadYamlFile } from '../utils/yaml.js'

import { checkObject } from './check.js'

// Load and parse `spyd.*` file contents
export const loadConfigContents = async function (configPath) {
  const loadFunc = EXTENSIONS[extname(configPath)]

  if (loadFunc === undefined) {
    throw new UserError(
      `The configuration file format is not supported: ${configPath}
Please use .yml, .js, .mjs or .cjs`,
    )
  }

  try {
    const configContents = await loadFunc(configPath)
    checkObject(configContents, 'config')
    return configContents
  } catch (error) {
    throw new UserError(
      `Could not load configuration file '${configPath}': ${error.message}`,
    )
  }
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
// We allow JavaScript files for dynamic configs such as:
//  - Using environment variables (including checking if is CI) or platform test
//  - Computing a long list of inputs
// We use YAML instead of JSON to:
//  - Allow comments
//  - Enforce consistency with `cli` runner's `tasks.yml`
const EXTENSIONS = {
  '.js': importJsDefault,
  '.mjs': importJsDefault,
  '.cjs': importJsDefault,
  '.yml': loadYamlFile,
  '.yaml': loadYamlFile,
}
// Order is significant
export const CONFIG_EXTENSIONS = Object.keys(EXTENSIONS)
