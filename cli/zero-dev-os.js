const chalk = require("chalk")
const program = require("commander")
const shell = require("shelljs")
const _ = require("lodash")
const fs = require("fs")

const ZeroDevContainer = require("./src/actions/zero-dev-container")
const ZeroDevContainerOS = require("./src/actions/zero-dev-container-os")
const ZeroDevInit = require("./src/actions/zero-dev-init")
const ZeroDevInstall = require("./src/actions/zero-dev-install")
const ZeroDevUpdate = require("./src/actions/zero-dev-update")

const utils = require("./src/utils/zero-dev-utils")

class ZeroDevOS {
  constructor(options) {
    this.options = options

    this.options.workDir = process.env["PWD"]
    this.options.zeroDevOSDir = __dirname.replace(/\/cli$/, "")

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

  container() {
    let zeroDevContainer = new ZeroDevContainer(this.options)
    zeroDevContainer.exec().then(() => {
      utils.message("Done...")
    })
  }

  init() {
    let zeroDevInit = new ZeroDevInit(this.options)
    zeroDevInit.exec().then(() => {
      utils.message("Done...")
    })
  }

  install() {
    this.options.install = true

    let zeroDevInstall = new ZeroDevInstall(this.options)
    zeroDevInstall.exec().then(() => {
      utils.message("Done...")
    })
  }

  containerOS() {
    let zeroDevContainerOS = new ZeroDevContainerOS(this.options)
    zeroDevContainerOS.exec().then(() => {
      utils.message("Done...")
    })
  }

  update() {
    let zeroDevUpdate = new ZeroDevUpdate(this.options)
    zeroDevUpdate.exec().then(() => {
      utils.message("Done...")
    })
  }
}

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
  .command("init")
  .description("Initialize zero-dev-os")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({})

    zeroDevOS.init()
  })

program
  .command("install")
  .option("--core", "Install Zero Dev OS Core")
  .option("--bashrc", "Install Zero Dev OS Bashrc")
  .option("--vimrc", "Install Zero Dev OS Vimrc")
  .option("--limit-swap", "Limit Swappiness")
  .option("--disable-sudo-password", "Disable sudo password for admin user (developer)")
  .option("--desktop", "Install Zero Dev OS Desktop")
  .option("--development", "Install Zero Dev OS Development")
  .option("--graphics", "Install Zero Dev OS Graphics")
  .option("--lxd", "Install Zero Dev OS LXD")
  .option("--mongo", "Install Zero Dev OS Mongo")
  .description("Install Zero Dev OS")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      bashrc: options.bashrc,
      core: options.core,
      desktop: options.desktop,
      development: options.development,
      disableSudoPassword: options.disableSudoPassword,
      graphics: options.graphics,
      lxd: options.lxd,
      limitSwap: options.limitSwap,
      mongo: options.mongo,
      vimrc: options.vimrc,
    })

    zeroDevOS.install()
  })

program
  .command("os")
  .option("--base-image <base image>", "Base image for zero-dev-os (defaults to debian/10)")
  .option("--image-name <image name>", "Image name (defaults to zero-dev-os)")
  .description("Create zero-dev-os lxc image")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      baseImage: options.baseImage,
      imageName: options.imageName
    })

    zeroDevOS.containerOS()
  })

program
  .command("update")
  .option("--git-repo", "Pull latest from zero-dev-os git repository")
  .option("--host-os", "Update Host OS")
  .description("Update zero-dev-os")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      gitRepo: options.gitRepo,
      hostOS: options.hostOs
    })

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
