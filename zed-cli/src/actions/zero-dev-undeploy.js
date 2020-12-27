const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevUndeploy {
  constructor(options) {
    this.options = options
    this.command = "undeploy"

    this.validate()
    this.getProject()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      utils.cd(this.project.name)
      utils.shell("./undeploy.sh")

      resolve({
        status: "OK"
      })
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  getProject() {
    this.project = utils.getProject(this.options.projectFile)

    if(this.project) {
      // Add options to project
      this.project.options = this.options

      utils.message("Project:")
      console.log(JSON.stringify(this.project, null, 2))
    }
    else {
      utils.message("Hmmm...")
      utils.error(`Can't seem to find ${this.options.projectFile} here...`)

      console.log()
      utils.message("Please resolve and try again.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zed build --help`)

      process.exit(-1)
    }

  }

  validate() {
    let validOptions = true
    let messages = []

    if(!this.options.projectFile) {
      messages.push("--project is required")
      validOptions = false
    }

    if(!validOptions) {
      console.log()
      utils.message("Hmmm...")

      messages.forEach((message) => {
        utils.error(message)
      })

      console.log()
      utils.message("Please resolve and try again.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zed ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevUndeploy
