const chalk = require("chalk")
const program = require("commander")
const shell = require("shelljs")
const _ = require("lodash")
const fs = require("fs")
const ZeroDevOS = require("./src/zero-dev-os")

program
  .command("init")
  .description("Initialize zero-dev-os")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({})

    zeroDevOS.init()
  })

program
  .command("install")
  .option("--all", "Install Zero Dev OS with everything")
  .option("--core", "Install Zero Dev OS Core")
  .option("--desktop", "Install Zero Dev OS Desktop")
  .description("Install Zero Dev OS")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      all: options.all,
      core: options.core,
      desktop: options.desktop,
    })

    zeroDevOS.install()
  })

program
  .command("update")
  .description("Update zero-dev-os")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({})

    zeroDevOS.update()
  })

program
  .command("container")
  .option("--operation <operation>", "[list|create|delete|stop|start|restart] (REQUIRED)")
  .option("--container-name <containerName>", "Container name (REQUIRED)")
  .option("--image-name <image name>", "Image name (defaults to zero-dev-os)")
  .description("LXC container operations")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      operation: options.operation,
      containerName: options.containerName,
      imageName: options.imageName
    })

    zeroDevOS.container()
  })

program
  .command("doctor")
  .description("Show development environment settings")
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
