const registerCypressGrep = require('@cypress/grep')
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
registerCypressGrep()

import "./commands"
import "cypress-plugin-api"
import "cypress-wait-until"
import "cypress-file-upload"
import "cypress-fill-command"
import "cypress-react-selector"
import "cypress-real-events/support"
import "cypress-mailosaur"
import "cypress-localstorage-commands"
import "@4tw/cypress-drag-drop"
import "papaparse"

const logsCollectorOptions = {
    collectTypes: ["cy:log"]
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require("cypress-terminal-report/src/installLogsCollector")(logsCollectorOptions)
  Cypress.on("uncaught:exception", () => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })
  