import { listHistory } from '../history/main.js'
import { startPreviewRefresh, endPreviewRefresh } from '../preview/refresh.js'
import { startPreview } from '../preview/start_end.js'

import { measureBenchmark } from './main.js'
import { getPreviewConfig, setFirstPreview } from './preview_report.js'

// Start preview then measure benchmark
export const previewStartAndMeasure = async function ({
  combinations,
  config,
  config: { quiet },
  initResult,
}) {
  const { previewConfig, previewState } = getPreviewConfig(initResult, config)
  await setFirstPreview({ combinations, previewConfig, previewState })
  await startPreview(quiet)

  return await previewRefreshAndMeasure({
    combinations,
    config,
    previewConfig,
    previewState,
  })
}

// Start preview refresh then measure benchmark
const previewRefreshAndMeasure = async function ({
  combinations,
  config,
  config: { cwd, duration, quiet },
  previewConfig,
  previewState,
}) {
  const benchmarkDuration = getBenchmarkDuration(combinations, duration)
  const previewId = await startPreviewRefresh({
    previewState,
    benchmarkDuration,
    quiet,
  })

  try {
    const results = await listHistory(config)
    const previewConfigA = { ...previewConfig, results }

    const { combinations: combinationsA, stopped } = await measureBenchmark(
      combinations,
      {
        duration,
        cwd,
        previewConfig: previewConfigA,
        previewState,
        exec: false,
      },
    )
    return { combinations: combinationsA, stopped, results }
  } finally {
    await endPreviewRefresh({
      previewState,
      previewId,
      benchmarkDuration,
      quiet,
    })
  }
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
}
