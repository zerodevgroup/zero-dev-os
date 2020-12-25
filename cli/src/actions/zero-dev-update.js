const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevUpdate {
  constructor(options) {
    this.options = options
    this.command = "update"

    console.log()
    utils.message("options:")
    console.log(this.options)

    this.operations = [
      "gitRepo",
      "hostOS",
    ]

    this.validate()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.operations.forEach((operation) => {
        if(this.options[operation]) {
          this[operation]()
        }
      })

      resolve()

    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  gitRepo() {
    // Go to the zero-dev-os directory
    utils.cd(this.options.zeroDevOSDir)

    // Compare local and remote commit ids
    let localCommitId = utils.chomp(shell.exec('git rev-parse HEAD', {silent:true}).stdout)
    let remoteCommitId = utils.chomp(shell.exec("git ls-remote | grep HEAD  | awk '{print $1}'", {silent:true}).stdout)

    utils.message(`local  commit id: ${localCommitId}`)
    utils.message(`remote commit id: ${remoteCommitId}`)

    if(localCommitId !== remoteCommitId) {
      utils.message(`pulling ${this.options.zeroDevOSDir}`)
      utils.shell("git pull")
    }
    else {
      utils.message(`${this.options.zeroDevOSDir} is up to date`)
    }

    utils.cd(this.options.workDir)
  }

  hostOS() {
    // Upgrade OS
    utils.shell("apt update")
    utils.shell("apt --yes upgrade")
    utils.shell("apt --yes autoremove")
  }

  //
  // Utility methods
  //

  validate() {
    let validOptions = false
    let messages = []

    this.operations.forEach((operation) => {
      if(this.options[operation]) {
        validOptions = true
      }
    })

    if(!validOptions) {
      console.log()
      utils.warn("no operations were specified...")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zed ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevUpdate
