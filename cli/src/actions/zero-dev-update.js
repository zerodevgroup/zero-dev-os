const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")
const ComponentBase = require("../base/component-base.js")

class ZeroDevUpdate extends ComponentBase {
  constructor(options) {
    super(options)
    this.command = "update"

    console.log()
    this.utils.message("Options:")
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
      this.utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  gitRepo() {
    // Go to the zero-dev-os directory
    this.utils.cd(this.options.zeroDevOSDir)

    // Compare local and remote commit ids
    let localCommitId = this.utils.chomp(shell.exec('git rev-parse HEAD', {silent:true}).stdout)
    let remoteCommitId = this.utils.chomp(shell.exec("git ls-remote | grep HEAD  | awk '{print $1}'", {silent:true}).stdout)

    this.utils.message(`Local  Commit ID: ${localCommitId}`)
    this.utils.message(`Remote Commit ID: ${remoteCommitId}`)

    if(localCommitId !== remoteCommitId) {
      this.utils.message(`Pulling ${this.options.zeroDevOSDir}.`)
      this.utils.shell("git pull")
    }
    else {
      this.utils.message(`${this.options.zeroDevOSDir} is up to date.`)
    }

    this.utils.cd(this.options.workDir)
  }

  hostOS() {
    // Upgrade OS
    this.utils.shell("apt update")
    this.utils.shell("apt --yes upgrade")
    this.utils.shell("apt --yes autoremove")
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
      this.utils.warn("No operations were specified.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zero-dev-os ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevUpdate
