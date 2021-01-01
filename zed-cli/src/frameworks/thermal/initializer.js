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
        this.utils.message(`Initializing ${this.project.name}`)

        this.utils.shell(`mkdir -p ./${this.project.name}/src`)
        this.utils.shell(`mkdir -p ./${this.project.name}/public/libs`)
        this.utils.shell(`mkdir -p ./${this.project.name}/public/images`)
        this.utils.shell(`mkdir -p ./${this.project.name}/public/css`)
        this.utils.shell(`mkdir -p ./${this.project.name}/public/thermal/components`)
        this.utils.shell(`mkdir -p ./${this.project.name}/public/thermal/core`)

        this.utils.cd(this.project.options.workDir)
      }

      if(this.project.assets && fs.existsSync(`${this.project.assets}`)) {
        this.utils.shell(`cp -r ${this.project.assets}/* ./${this.project.name}/public`)
      }

      if(this.project.framework.config && fs.existsSync(`${this.project.framework.config}`)) {
        this.utils.shell(`cp ${this.project.framework.config} ./${this.project.name}/public/thermal/thermal-config.js`)
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
