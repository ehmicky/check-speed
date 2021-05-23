import { extname } from 'path'

import { UserError } from '../error/main.js'
import { importJsDefault } from '../utils/import.js'
import { loadYamlFile } from '../utils/yaml.js'

// Load and parse `spyd.*` file contents
export const loadConfigContents = async function (config) {
  const loadFunc = EXTENSIONS[extname(config)]

  if (loadFunc === undefined) {
    throw new UserError(
      `The configuration file format is not supported: ${config}
Please use .yml, .js, .cjs or .ts`,
    )
  }

  try {
    return await loadFunc(config)
  } catch (error) {
    throw new UserError(
      `Could not load configuration file '${config}': ${error.message}`,
    )
  }
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
const EXTENSIONS = {
  '.yml': loadYamlFile,
  '.yaml': loadYamlFile,
  '.js': importJsDefault,
  '.cjs': importJsDefault,
  '.ts': importJsDefault,
}