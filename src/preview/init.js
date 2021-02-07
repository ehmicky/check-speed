import { addInitProps } from '../measure/props.js'

import { setPreviewReport } from './report.js'
import { setDelayedDescription } from './set.js'
import { startPreview } from './start_end.js'
import { updatePreview } from './update.js'

// Start preview
export const initPreview = async function ({
  combinations,
  duration,
  previewConfig,
  previewConfig: { quiet },
}) {
  const previewState = {}

  if (quiet) {
    return previewState
  }

  await setFirstPreview({ combinations, previewState, previewConfig })
  await startPreview()
  await updatePreview({ previewState, combinations, duration })

  setDelayedDescription(previewState, START_DESCRIPTION)
  return previewState
}

const setFirstPreview = async function ({
  combinations,
  previewState,
  previewConfig,
}) {
  const combinationsA = combinations.map(addInitProps)
  await setPreviewReport({
    combinations: combinationsA,
    previewState,
    previewConfig,
  })
}

const START_DESCRIPTION = 'Starting...'
