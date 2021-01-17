import { callReportFunc } from './call.js'
import { handleReportConfig } from './config.js'
import { getContents } from './content.js'
import { insertContent } from './insert.js'
import { printContent } from './print.js'

// Report results
export const report = async function (
  result,
  {
    reporters,
    output,
    insert,
    colors,
    showDiff,
    showSystem,
    showMetadata,
    link,
  },
) {
  await Promise.all(
    reporters.map(({ report: reportFunc, config: reportConfig }) =>
      useReporter({
        reportFunc,
        reportConfig,
        result,
        output,
        insert,
        colors,
        showDiff,
        showSystem,
        showMetadata,
        link,
      }),
    ),
  )
}

// Perform each reporter
const useReporter = async function ({
  reportFunc,
  reportConfig,
  result,
  output,
  insert,
  colors,
  showDiff,
  showSystem,
  showMetadata,
  link,
}) {
  const reportConfigA = handleReportConfig(reportConfig, {
    output,
    insert,
    colors,
    showDiff,
    showSystem,
    showMetadata,
    link,
  })

  const content = await callReportFunc({
    reportFunc,
    result,
    reportConfig: reportConfigA,
  })

  if (!hasContent(content)) {
    return
  }

  const { nonInteractiveContent, interactiveContent } = getContents(
    reportConfigA,
    content,
  )
  await Promise.all([
    printContent(reportConfigA, nonInteractiveContent, interactiveContent),
    insertContent(reportConfigA, nonInteractiveContent),
  ])
}

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
const hasContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
}
