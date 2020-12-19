const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")
const ComponentBase = require("../base/component-base.js")

class ZeroDevUpdate extends ComponentBase {
  constructor(options) {
    super(options);
    this.command = "update"

    this.utils.message("Options")
    console.log(this.options)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      // Go to the zero-dev-os directory
      this.utils.cd(this.options.zeroDevOSDir)

      // Compare local and remote commit ids
      let localCommitId = this.utils.chomp(shell.exec('git rev-parse HEAD', {silent:true}).stdout)
      let remoteCommitId = this.utils.chomp(shell.exec("git ls-remote | grep HEAD  | awk '{print $1}'", {silent:true}).stdout)

      this.utils.message(`Local  Commit ID: ${localCommitId}`)
      this.utils.message(`Remote Commit ID: ${remoteCommitId}`)

      if(localCommitId !== remoteCommitId) {
        this.utils.message(`Updating ${this.options.zeroDevOSDir}...`)
        this.utils.shell("git pull")

        // Update core
        this.utils.shell(`${this.options.zeroDevOSDir}/zero-dev-os.sh install --core`)

        // Update container os
        this.utils.shell(`${this.options.zeroDevOSDir}/zero-dev-os.sh os`)
      }
      else {
        this.utils.message(`No update required for ${this.options.zeroDevOSDir}...`)
      }

      // Run scripts associated with Commit ID

      this.utils.cd(this.options.workDir)

      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }
} 

module.exports = ZeroDevUpdate
