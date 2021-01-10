const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

const Doc = require("./zero-dev-doc/doc.js")

class ZeroDevDoc {
  constructor(options) {
    this.options = options
    this.command = "doc"

    this.validate()
    this.getProject()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      // this.utils.shell(`mkdir -p ${this.project.name}/assets`)
      // this.utils.shell(`cp -r ${this.project.assets}/* ${this.project.name}/assets`)
      // this.utils.cd(this.project.name)

      this.project.config.docs.forEach((docInstance) => {
        let config = {
          page: this.project.config.page,
          style: this.project.config.style
        }

        let docOptions = Object.assign({ config: config }, docInstance)

        let doc = new Doc(docOptions)

        docOptions.items.forEach((item) => {
          doc.append(item)
        })

        doc.save()
      })

      resolve({
        status: "OK"
      })
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  getProject() {
    this.project = this.utils.getProject(this.options.projectFile)

    if(this.project) {
      // Add options to project
      this.project.options = this.options

      this.utils.message("Project:")
      console.log(JSON.stringify(this.project, null, 2))
    }
    else {
      this.utils.message("Hmmm...")
      this.utils.error(`Can't seem to find ${this.options.projectFile} here...`)

      console.log()
      this.utils.message("Please resolve and try again.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/dez ${this.command} --help`)

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
      this.utils.message("Hmmm...")

      messages.forEach((message) => {
        this.utils.error(message)
      })

      console.log()
      this.utils.message("Please resolve and try again.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/dez ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevDoc
