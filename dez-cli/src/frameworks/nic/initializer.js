const fs = require("fs")
const shell = require("shelljs")
const GenerateBase = require("../../base/generate-base.js")

class Initializer extends GenerateBase {
  constructor(project) {
    super(project)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.utils.title("Initializer")

      if(!fs.existsSync(`${this.project.name}`)) {
        this.utils.shell(`ionic start ${this.project.name} tabs --type=angular --capacitor`)

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
