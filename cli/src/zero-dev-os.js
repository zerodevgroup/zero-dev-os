const ZeroDevContainer = require("./actions/zero-dev-container")
const ZeroDevContainerOS = require("./actions/zero-dev-container-os")
const ZeroDevInit = require("./actions/zero-dev-init")
const ZeroDevInstall = require("./actions/zero-dev-install")
const ZeroDevUpdate = require("./actions/zero-dev-update")

const utils = require("./utils/zero-dev-utils")

class ZeroDevOS {
  constructor(options) {
    this.options = options

    this.options.workDir = process.env["PWD"]
    this.options.zeroDevOSDir = __dirname.replace(/\/cli\/src$/, "")

    console.log(process.env["EUID"])
    console.log(process.env["SUDO_USER"])
    console.log(process.env["USER"])

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

module.exports = ZeroDevOS
