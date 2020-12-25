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
      utils.message("done.")
    })
  }


  install() {
    this.options.install = true

    let zeroDevInstall = new ZeroDevInstall(this.options)
    zeroDevInstall.exec().then(() => {
      utils.message("done.")
    })
  }

  update() {
    let zeroDevUpdate = new ZeroDevUpdate(this.options)
    zeroDevUpdate.exec().then(() => {
      utils.message("done.")
    })
  }
}

program
  .command("container")
  .option("--list", "list containers")
  .option("--create [containerName]", "create container")
  .option("--delete <containerName>", "delete container")
  .option("--start <containerName>", "start container")
  .option("--stop <containerName>", "stop container")
  .option("--restart <containerName>", "restart container")
  .option("--create-os-image", "create zero-dev-os image")
  .option("--update-hosts", "update /etc/hosts with container info")
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
  .option("--core", "install zero-dev-os core")
  .option("--bashrc", "install zero-dev-os bashrc")
  .option("--vimrc", "install zero-dev-os vimrc")
  .option("--limit-swap", "limit swappiness")
  .option("--disable-sudo-password", "disable sudo password for admin user (developer)")
  .option("--desktop", "install zero-dev-os desktop")
  .option("--development", "install zero-dev-os development")
  .option("--graphics", "install zero-dev-os graphics")
  .option("--lxd", "install lxd")
  .option("--postgres", "install postgresql db")
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
      postgres: options.postgres,
      vimrc: options.vimrc,
    })

    zeroDevOS.install()
  })

program
  .command("update")
  .option("--git-repo", "pull latest from zero-dev-os git repository")
  .option("--host-os", "update host os")
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
