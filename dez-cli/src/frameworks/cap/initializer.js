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
        this.utils.error("Error: Missing initial capacitor plugin project.")
        this.utils.warn("Run the following command to create:")
        this.utils.message("npx @capacitor/cli plugin:generate")
        process.exit(-1)

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
