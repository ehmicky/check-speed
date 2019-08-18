import fastDeepEqual from 'fast-deep-equal'

import { removeDuplicates } from '../iterations/duplicate.js'

// Merge previous benchmarks part of the same `job`
export const mergeJobBenchmarks = function(benchmarks, benchmark) {
  return benchmarks
    .filter(benchmarkA => benchmarkA.job === benchmark.job)
    .reduce(mergeBenchmarks, benchmark)
}

const mergeBenchmarks = function(
  { env, envs = [env], iterations, ...benchmark },
  { env: previousEnv, iterations: previousIterations },
) {
  const envsA = mergeEnv(envs, previousEnv)
  const iterationsA = removeDuplicates([...iterations, ...previousIterations])
  return { ...benchmark, envs: envsA, iterations: iterationsA }
}

const mergeEnv = function(envs, previousEnv) {
  const duplicateEnv = envs.find(env => env.id === previousEnv.id)

  if (duplicateEnv === undefined) {
    return [...envs, previousEnv]
  }

  SAME_ENV_PROPS.forEach(propName =>
    validateEnv(duplicateEnv, previousEnv, propName),
  )

  return envs
}

const SAME_ENV_PROPS = ['options']

const validateEnv = function(env, previousEnv, propName) {
  // TODO: replace with util.isDeepStrictEqual() once dropping support for
  // Node 8
  if (!fastDeepEqual(env[propName], previousEnv[propName])) {
    throw new Error(`Several benchmarks with the same "job" and "env" cannot have different ${propName}:
${JSON.stringify(env[propName])}
${JSON.stringify(previousEnv[propName])}`)
  }
}
