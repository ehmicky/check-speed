import { normalizeMeasuredResult } from '../normalize/result.js'
import { reportPreview } from '../report/main.js'

import { updateCompletion } from './completion.js'
import {
  setDescriptionIf,
  START_DESCRIPTION,
  MEASURE_DESCRIPTION,
} from './description.js'
import { updateCombinationEnd } from './duration.js'
import { refreshPreview } from './update.js'

// Preview results progressively, as combinations are being measured.
// Reporters should:
//  - Handle combinations not measured yet, i.e. with `undefined` `stats`.
//     - Their titles should be reported so that users know which combinations
//       are left
//  - Try to limit the amount of flicker between previews
//     - For example, all combinations should be shown even if not measured yet.
//     - And the size of table should not change between previews.
// When uncalibrated, we skip it since no stats would be reported anyway.
// We wait until calibration before removing the start description.
export const updatePreviewStats = async function ({
  stats,
  stats: { samples },
  previewState,
  previewState: { quiet },
  durationState,
  precisionTarget,
}) {
  if (quiet || samples === 0) {
    return
  }

  updateResultStats({ previewState, stats })

  updateCombinationEnd({ stats, previewState, durationState, precisionTarget })
  setDescriptionIf(previewState, MEASURE_DESCRIPTION, START_DESCRIPTION)

  updateCompletion(previewState)
  await updatePreviewReport(previewState)
}

const updateResultStats = function ({
  previewState,
  previewState: { result, combinationIndex },
  stats,
}) {
  const combinations = [
    ...result.combinations.slice(0, combinationIndex),
    { ...result.combinations[combinationIndex], stats },
    ...result.combinations.slice(combinationIndex + 1),
  ]
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.result = { ...result, combinations }
}

export const updatePreviewReport = async function (previewState) {
  await updateReport({ previewState })
  await refreshPreview(previewState)
}

const updateReport = async function ({
  previewState,
  previewState: {
    durationLeft,
    percentage,
    index,
    total,
    combinationName,
    reporters,
    titles,
    result,
  },
}) {
  if (reporters.length === 0) {
    return
  }

  const resultA = normalizeMeasuredResult(result)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = await reportPreview(
    {
      ...resultA,
      preview: {
        durationLeft,
        percentage,
        index: index + 1,
        total,
        combinationName,
      },
    },
    { reporters, titles },
  )
}
