import { defineConfig } from "cypress"
const path = require("path")
const webpackPreprocessor = require("@cypress/webpack-preprocessor")
const installLogsPrinter = require("cypress-terminal-report/src/installLogsPrinter")

const viewportWidth = 1920
const viewportHeight = 1080
export const cypressConfig: Partial<Cypress.ConfigOptions> = {
  e2e: {
    video: true,
    videoCompression: false,
    trashAssetsBeforeRuns: true,
    setupNodeEvents(on, config) {
      // `on` is used to hook into various events Cypress emits
      on("file:preprocessor", require("./cypress/support/cy-ts-preprocessor"))
      on("file:preprocessor", webpackPreprocessor({ webpackOptions: require("./cypress/support/webpack.config") }))
      
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          // `launchOptions.args` are the arguments that will be passed to the browser when Cypress launches it.
          // we are setting a fixed height of 1000px for the browser window, since that's big enough for our desired viewport
          // height of 720px.
          launchOptions.args.push(`--window-size=${viewportWidth},${viewportHeight}`);
        }
        return launchOptions;
      });
      // `config` is the resolved Cypress config
      // cypress-dotenv plugins doesn't work correctly
      const configFileName = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env"
      const configWithDotenv = require("dotenv").config({
        path: path.resolve(process.cwd(), configFileName)
      })
      if (configWithDotenv.error) {
        throw configWithDotenv.error
      }
      const env = { ...configWithDotenv.parsed, ...process.env,...config.env }
      env.grepFilterSpecs = true
      env.grepOmitFiltered = true

      Object.assign(config, {
        env,
        baseUrl: env.BASE_URL,
        projectId: env.PROJECT_ID
      })

      installLogsPrinter(on, {
        printLogsToConsole: "always"
      })
      require('@cypress/grep/src/plugin')(config);
      if (env.MANUAL_RUN === "1" || env.CY_DEBUG !== "0") {
        console.log("Using 'junit' as a reporter for manual run")
        config.reporter = "junit"
        config.reporterOptions = {}
      } else {
        require("cypress-qase-reporter/plugin")(on, config)
        config.reporterOptions.cypressQaseReporterReporterOptions.testops.api.token = env.QASE_TESTOPS_API_TOKEN
        config.reporterOptions.cypressQaseReporterReporterOptions.testops.run.id = env.QASE_TESTOPS_RUN_ID
      }
      console.log(`Base URL: ${config.baseUrl}`)

      return config
    },
    defaultCommandTimeout: 20_000,
    chromeWebSecurity: false,
    viewportWidth,
    viewportHeight,
    scrollBehavior: "nearest",
    reporter: "cypress-multi-reporters",
    reporterOptions: {
      domain: "api.qase.io",
      reporterEnabled: "cypress-qase-reporter",
      cypressQaseReporterReporterOptions: {
        mode: "testops",
        debug: true,
        testops: {
          project: "WEB",
          uploadAttachments: true,
          api: {
            token: null
          },
          run: {
            id: null
          }
        },

        framework: {
          cypress: {
            screenshotsFolder: "cypress/screenshots"
          }
        }
      },
      runName: "Cypress autotest run - ",
      createTestRun: false,
      filters: {
        dev: [
          {
            key: "custom_dev_run",
            operator: "===",
            value: true
          }
        ],
        stg: [
          {
            key: 1,
            operator: "===",
            value: "1"
          }
        ],
        qa: [
          {
            key: "custom_qa_run",
            operator: "===",
            value: true
          }
        ],
        prod: [
          {
            key: 2,
            operator: "===",
            value: "1"
          }
        ]
      }
    },
    retries: {
      runMode: 0,
      openMode: 0
    }
  }
}

export default defineConfig({ ...cypressConfig })
