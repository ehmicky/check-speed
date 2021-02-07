import { updatePreview } from './update.js'

// Update preview at regular interval
export const startPreviewInterval = function ({
  previewState,
  combinations,
  duration,
  quiet,
}) {
  if (quiet) {
    return
  }

  const previewId = setInterval(() => {
    updatePreview({ previewState, combinations, duration })
  }, UPDATE_FREQUENCY)
  return previewId
}

// How often (in milliseconds) to update preview
const UPDATE_FREQUENCY = 1e2

// End preview.
// When stopped, we keep the last preview.
// We do not clear the preview so that we can decide whether to clear later:
//  - When succeeding, we wait for the final reporter.report() before clearing
//  - When stopping or aborting, we keep the last preview
//  - When failing, we clear it
export const endPreviewInterval = function (previewId) {
  if (previewId === undefined) {
    return
  }

  clearInterval(previewId)
}
