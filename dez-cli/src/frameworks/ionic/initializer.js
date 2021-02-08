const fs = require("fs")
const shell = require("shelljs")
const _ = require("lodash")
const GenerateBase = require("../../base/generate-base.js")

class Initializer extends GenerateBase {
  constructor(project) {
    super(project)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.utils.title("Initializer")

      if(!fs.existsSync(`${this.project.name}`)) {
        this.utils.shell(`mkdir -p ${this.project.name}`)

        this.utils.cd(this.project.name)
        let appName = _.upperFirst(_.camelCase(this.project.name))
        this.utils.shell(`ionic start ${appName} sidemenu --type=angular --capacitor`)

        this.utils.cd(this.project.options.workDir)
      }

      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }
}

module.exports = Initializer
