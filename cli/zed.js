const chalk = require("chalk")
const program = require("commander")
const shell = require("shelljs")
const _ = require("lodash")
const fs = require("fs")

const ZeroDevContainer = require("./src/actions/zero-dev-container")
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


  install() {
    this.options.install = true

    let zeroDevInstall = new ZeroDevInstall(this.options)
    zeroDevInstall.exec().then(() => {
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
  .option("--list", "List containers")
  .option("--create [containerName]", "Create container")
  .option("--delete <containerName>", "Delete container")
  .option("--start <containerName>", "Start container")
  .option("--stop <containerName>", "Stop container")
  .option("--restart <containerName>", "Restart container")
  .option("--create-os-image", "Create zero-dev-os image")
  .option("--update-hosts", "Update /etc/hosts with container info")
  .description("container operations")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      list: options.list,
      create: options.create,
      delete: options.delete,
      start: options.start,
      stop: options.stop,
      restart: options.restart,
      createOSImage: options.createOsImage,
      updateHosts: options.updateHosts,
    })

    zeroDevOS.container()
  })

program
  .command("install")
  .option("--core", "Install zero-dev-os Core")
  .option("--bashrc", "Install zero-dev-os Bashrc")
  .option("--vimrc", "Install zero-dev-os Vimrc")
  .option("--limit-swap", "Limit Swappiness")
  .option("--disable-sudo-password", "Disable sudo password for admin user (developer)")
  .option("--desktop", "Install zero-dev-os Desktop")
  .option("--development", "Install zero-dev-os Development")
  .option("--graphics", "Install zero-dev-os Graphics")
  .option("--lxd", "Install zero-dev-os LXD")
  .option("--mongo", "Install zero-dev-os Mongo")
  .description("install zero-dev-os")
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
  .command("update")
  .option("--git-repo", "Pull latest from zero-dev-os git repository")
  .option("--host-os", "Update Host OS")
  .description("update zero-dev-os")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      gitRepo: options.gitRepo,
      hostOS: options.hostOs
    })

    zeroDevOS.update()
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
