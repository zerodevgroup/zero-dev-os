const chalk = require("chalk")
const program = require("commander")
const shell = require("shelljs")
const _ = require("lodash")
const fs = require("fs")

const ZeroDevDeploy = require("./src/actions/zero-dev-deploy")
const ZeroDevScaffold = require("./src/actions/zero-dev-scaffold")

const utils = require("./src/utils/zero-dev-utils")

class ZeroDevOS {
  constructor(options) {
    this.options = options

    this.options.workDir = process.env["PWD"]
    this.options.zeroDevOSDir = __dirname.replace(/\/dez-cli$/, "")

    if(process.env["SUDO_USER"]) {
      // sudo user
      this.options.user = process.env["SUDO_USER"]
      if(process.env["SUDO_USER"] === "root") {
        this.options.home = "/root"
      }
      else {
        this.options.home = `/home/${this.options.user}`
      }
    }
    else {
      // user
      this.options.user = process.env["USER"]

      if(!this.options.user) {
        this.options.user = "root"
      }

      this.options.home = process.env["HOME"]
    }
  }

  deploy() {
    let zeroDevDeploy = new ZeroDevDeploy(this.options)
    zeroDevDeploy.exec().then(() => {
      utils.message("done.")
    })
  }

  scaffold() {
    let zeroDevScaffold = new ZeroDevScaffold(this.options)
    zeroDevScaffold.exec().then(() => {
      utils.message("done.")
    })
  }
}

program
  .command("deploy")
  .description("deploy application to pm2")
  .option("--project <project file>", "Project configuration file (REQUIRED)")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      projectFile: options.project,
    })

    zeroDevOS.deploy()
  })

program
  .command("scaffold")
  .description("scaffold project source code")
  .option("--project <project file>", "Project configuration file (REQUIRED)")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      projectFile: options.project,
    })

    zeroDevOS.scaffold()
  })

program
  .command("doctor")
  .description("show development environment settings")
  .action((type) => {
    const platform = process.platform
    const nodePath = _.trim(shell.which("node"))
    const npmVersion = _.trim(shell.exec("npm --version", { silent: true }).stdout)
    const npmPath = _.trim(shell.which("npm"))
    const nodeVersion = _.trim(shell.exec("node --version", { silent: true }).stdout)

    const body = `
=================================
Computer
  Platform: ${platform}
Node
  Version: ${nodeVersion}
  ${nodePath}
NPM
  Version: ${npmVersion}
  ${npmPath}
=================================
`
    console.log(body)
  })

program.parse(process.argv)

if(program.rawArgs.length < 3) program.help()
