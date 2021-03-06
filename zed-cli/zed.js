const chalk = require("chalk")
const program = require("commander")
const shell = require("shelljs")
const _ = require("lodash")
const fs = require("fs")

const ZeroDevContainer = require("./src/actions/zero-dev-container")
const ZeroDevHost = require("./src/actions/zero-dev-host")
const ZeroDevInstall = require("./src/actions/zero-dev-install")
const ZeroDevNginx = require("./src/actions/zero-dev-nginx")
const ZeroDevUpdate = require("./src/actions/zero-dev-update")

const utils = require("./src/utils/zero-dev-utils")

class ZeroDevOS {
  constructor(options) {
    this.options = options

    this.options.workDir = process.env["PWD"]
    this.options.zeroDevOSDir = __dirname.replace(/\/zed-cli$/, "")

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

  host() {
    let zeroDevHost = new ZeroDevHost(this.options)
    zeroDevHost.exec().then(() => {
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

  nginx() {
    let zeroDevNginx = new ZeroDevNginx(this.options)
    zeroDevNginx.exec().then(() => {
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
  .option("--update-hosts <containerName>", "update container /etc/hosts with container info")
  .option("--multipass", "let zed know when using multipass")
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
      multipass: options.multipass,
    })

    zeroDevOS.container()
  })

program
  .command("host")
  .option("--update-hosts", "update /etc/hosts with container info")
  .option("--multipass", "let zed know when using multipass")
  .description("host operations")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      updateHosts: options.updateHosts,
      multipass: options.multipass,
    })

    zeroDevOS.host()
  })

program
  .command("install")
  .option("--core", "install zero-dev-os core")
  .option("--bashrc", "install zero-dev-os bashrc")
  .option("--desktop", "install zero-dev-os desktop")
  .option("--development", "install zero-dev-os development")
  .option("--disable-sudo-password", "disable sudo password for admin user (developer)")
  .option("--flatpak", "install zero-dev-os flatpak")
  .option("--graphics", "install zero-dev-os graphics")
  .option("--limit-swap", "limit swappiness")
  .option("--lxd", "install lxd")
  .option("--postgres", "install postgresql db")
  .option("--postgres-client", "install postgresql db client")
  .option("--swift", "install swift")
  .option("--vimrc", "install zero-dev-os vimrc")
  .description("install zero-dev-os")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      bashrc: options.bashrc,
      core: options.core,
      desktop: options.desktop,
      development: options.development,
      disableSudoPassword: options.disableSudoPassword,
      flatpak: options.flatpak,
      graphics: options.graphics,
      lxd: options.lxd,
      limitSwap: options.limitSwap,
      postgres: options.postgres,
      postgresClient: options.postgresClient,
      swift: options.swift,
      vimrc: options.vimrc,
    })

    zeroDevOS.install()
  })

program
  .command("nginx")
  .description("configure nginx")
  .option("--container", "configure nginx for a container")
  .option("--port [port]", "application port")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      container: options.container,
      port: options.port,
    })

    zeroDevOS.nginx()
  })

program
  .command("update")
  .option("--git-repo", "pull latest from zero-dev-os git repository")
  .option("--host-os", "update host os")
  .option("--host-name <host name>", "set host name")
  .description("update zero-dev-os")
  .action((options) => {
    let zeroDevOS = new ZeroDevOS({
      gitRepo: options.gitRepo,
      hostOS: options.hostOs,
      hostName: options.hostName,
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
