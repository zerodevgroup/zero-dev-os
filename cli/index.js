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
  .option("--core", "Install Zero Dev OS Core")
  .option("--desktop", "Install Zero Dev OS Desktop")
  .option("--essential", "Install Zero Dev OS Essentials (core, bashrc, vimrc)")
  .option("--all", "Install Zero Dev OS with everything")
  .option("--bashrc", "Install Zero Dev OS Bashrc")
  .option("--vimrc", "Install Zero Dev OS Vimrc")
  .option("--mongo", "Install Zero Dev OS Mongo")
  .option("--development", "Install Zero Dev OS Development")
  .option("--graphics", "Install Zero Dev OS Graphics")
  .description("Install Zero Dev OS")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      core: options.core,
      desktop: options.desktop,
      essential: options.essential,
      all: options.all,
      bashrc: options.bashrc,
      vimrc: options.vimrc,
      mongo: options.mongo,
      graphics: options.graphics,
      development: options.development,
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
  .option("--list", "List Containers")
  .option("--create", "Create a Container")
  .option("--delete", "Delete a Containers")
  .option("--stop", "Stop a Container")
  .option("--start", "Start a Container")
  .option("--restart", "Restart a Container")
  .option("--container-name <containerName>", "Container name (REQUIRED)")
  .option("--image-name <image name>", "Image name (defaults to zero-dev-os)")
  .description("LXC container operations")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      list: options.list,
      create: options.create,
      delete: options.delete,
      stop: options.stop,
      start: options.start,
      restart: options.restart,
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
