import { cwd as getCwd } from 'process'
import { resolve } from 'path'

import findUp from 'find-up'

import { loadYamlFile } from '../utils/yaml.js'

// Retrieve options from the configuration file (if any)
export const getConfig = async function({
  opts: { config, ...opts },
  opts: { cwd = getCwd() },
}) {
  const configPath = await getConfigPath(config, cwd)

  if (configPath === undefined) {
    return opts
  }

  const configContent = await getConfigContent(configPath)
  return { ...configContent, ...opts }
}

const getConfigPath = async function(config, cwd) {
  if (config !== undefined) {
    return resolve(cwd, config)
  }

  const configFile = await findUp(DEFAULT_CONFIG_FILES, { cwd })
  return configFile
}

const DEFAULT_CONFIG_FILES = ['spyd.yml', 'spyd.yaml']

const getConfigContent = async function(configPath) {
  try {
    return await loadYamlFile(configPath)
  } catch (error) {
    throw new Error(
      `Could not load configuration file '${configPath}': ${error.message}`,
    )
  }
}
