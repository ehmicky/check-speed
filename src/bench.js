import { getCombinations } from './combination/main.js'
import { addResultInfo } from './info.js'
import { measureCombinations } from './measure/main.js'
import { startProgress } from './progress/start.js'
import { stopProgress } from './progress/stop.js'

// Perform a new benchmark
export const performBenchmark = async function (config) {
  const { combinations, versions } = await getCombinations(config)

  const { progressState, progressInfo } = await startProgress(
    combinations,
    config,
  )

  try {
    return await getPartialResult({
      combinations,
      progressState,
      config,
      versions,
    })
  } finally {
    await stopProgress(progressInfo)
  }
}

const getPartialResult = async function ({
  combinations,
  progressState,
  config,
  versions,
}) {
  const combinationsA = await measureCombinations({
    combinations,
    config,
    progressState,
  })
  const partialResult = addResultInfo(combinationsA, { config, versions })
  return partialResult
}
