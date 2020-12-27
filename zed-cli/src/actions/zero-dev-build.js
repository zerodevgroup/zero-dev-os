const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevBuild {
  constructor(options) {
    this.options = options
    this.command = "build"

    this.validate()
    this.getProject()
    this.frameworkPath = options.frameworkPath ? options.frameworkPath : "../frameworks"
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.init().then(() => {
        this.generate().then(() => {
          // Wait for files to finish writing to disk
          setTimeout(() => {
            this.postProcess().then(() => {
              resolve()
            })
          }, 500)
        })
      })
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  init() {
    let promise = new Promise((resolve, reject) => {
      let framework = this.project.framework
      let Initializer = require(`${this.frameworkPath}/${framework.name}/initializer`)
      let initializer = new Initializer(this.project)
      initializer.exec().then(() => {
        resolve()
      })
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  generate() {
    let promise = new Promise((resolve, reject) => {
      let framework = this.project.framework
      let Generator = require(`${this.frameworkPath}/${framework.name}/generator`)
      let generator = new Generator(this.project)
      generator.exec().then(() => {
        resolve()
      })
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  postProcess() {
    let promise = new Promise((resolve, reject) => {
      let framework = this.project.framework
      let PostProcessor = require(`${this.frameworkPath}/${framework.name}/post-processor`)
      let postProcessor = new PostProcessor(this.project)
      postProcessor.exec().then(() => {
        resolve()
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

module.exports = ZeroDevBuild
