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
      this.utils.message(`Initializing ${this.project.name}`)

      this.createDirectory(`./${this.project.name}/src/components`)
      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }

  createDirectory(directoryName) {
    if(!fs.existsSync(directoryName)) {
      this.utils.message(`Creating ${directoryName}`)
      shell.mkdir("-p", directoryName)
    }
  }
}

module.exports = Initializer
