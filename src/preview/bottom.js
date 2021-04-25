import { goodColor, separatorColor } from '../report/utils/colors.js'
import { addPadding, PADDING_SIZE } from '../report/utils/indent.js'

// Retrieve bottom of preview
export const getPreviewBottom = function ({
  durationLeft,
  percentage,
  index,
  total,
  combinationName,
  description,
  actions,
  screenWidth,
}) {
  const leftWidth = getLeftWidth(durationLeft, total)
  const durationLeftA = durationLeft.padEnd(leftWidth)
  const progressBar = getProgressBar(durationLeftA, percentage, screenWidth)
  const counter = getCounter(index, total).padEnd(leftWidth)
  const descriptionA = getDescription(description)
  const actionsA = getActions(actions, leftWidth)

  const bottom = [
    `${durationLeftA}${progressBar}`,
    `${counter}${combinationName}${descriptionA}`,
    actionsA,
  ]
    .filter(Boolean)
    .join('\n\n')
  return addPadding(bottom)
}

const getLeftWidth = function (durationLeft, total) {
  return (
    Math.max(
      durationLeft.length,
      getCounter(total, total).length,
      ACTIONS_LABEL.length,
    ) + LEFT_WIDTH_PADDING
  )
}

const LEFT_WIDTH_PADDING = 2

// The `counter` is between `durationLeft` and `progressBar` so that there is
// no empty space when `durationLeft` is unknown.
const getCounter = function (index, total) {
  return `(${index + 1}/${total})`
}

const getProgressBar = function (durationLeft, percentage, screenWidth) {
  const progressBarWidth = screenWidth - PADDING_SIZE * 2 - durationLeft.length
  const filled = Math.floor(progressBarWidth * percentage)
  const filledChars = FILL_CHAR.repeat(filled)
  const voidedChars = VOID_CHAR.repeat(progressBarWidth - filled)
  return `${filledChars}${voidedChars}`
}

// Works with all terminals
const FILL_CHAR = goodColor('\u2588')
const VOID_CHAR = separatorColor('\u2591')

const getDescription = function (description) {
  if (description === '') {
    return ''
  }

  return separatorColor(`  (${description})`)
}

// Show keys available for user actions in previews
const getActions = function (actions, leftWidth) {
  const actionValues = Object.values(actions)

  if (actionValues.length === 0) {
    return
  }

  const actionsStr = actionValues.map(getAction).join(separatorColor(', '))
  return `${ACTIONS_LABEL.padEnd(leftWidth)}${actionsStr}`
}

const getAction = function ({ key, explanation }) {
  return `${goodColor(key)} ${separatorColor(`(${explanation})`)}`
}

export const ACTIONS_LABEL = 'Actions'
