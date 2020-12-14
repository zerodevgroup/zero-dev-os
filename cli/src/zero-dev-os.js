const ZeroDevContainer = require("./components/zero-dev-container")
const ZeroDevInit = require("./components/zero-dev-init")
const ZeroDevInstall = require("./components/zero-dev-install")
const ZeroDevUpdate = require("./components/zero-dev-update")

const utils = require("./utils/zero-dev-utils")

class ZeroDevOS {
  constructor(options) {
    this.options = options

    this.options.workDir = process.env["PWD"]
    this.options.zeroDevOSDir = __dirname.replace(/\/cli\/src$/, "")

    if(process.env["EUID"] === 0) {
      // root user
      this.options.user = "root"
      this.options.home = "/root"
    }
    else if(process.env["SUDO_USER"]) {
      // sudo user
      this.options.user = process.env["SUDO_USER"]
      this.options.home = `/home/${this.options.user}`
    }
    else {
      // user
      this.options.user = process.env["USER"]
      this.options.home = process.env["HOME"]
    }
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

  update() {
    let zeroDevUpdate = new ZeroDevUpdate(this.options)
    zeroDevUpdate.exec().then(() => {
      utils.message("Done...")
    })
  }

  container() {
    let zeroDevContainer = new ZeroDevContainer(this.options)
    zeroDevContainer.exec().then(() => {
      utils.message("Done...")
    })
  }
} 

module.exports = ZeroDevOS
