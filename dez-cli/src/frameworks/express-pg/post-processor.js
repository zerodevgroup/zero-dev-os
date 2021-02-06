const fs = require("fs")
const shell = require("shelljs")
const GenerateBase = require("../../base/generate-base.js")

class PostProcessor extends GenerateBase {
  constructor(project) {
    super(project)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.utils.title("PostProcessor")

      // Get project assets
      if(this.project.assets) {
        this.utils.shell(`cp -r  ${this.project.assets}/* ./${this.project.name}`)
      }

      // Get project schemas
      if(this.project.schemas) {
        this.utils.shell(`cp -r  ${this.project.schemas}/* ./${this.project.name}/schemas`)
      }

      this.utils.cd(`${this.project.options.workDir}/${this.project.name}`)

      if(!fs.existsSync(`node_modules`)) {
        this.utils.shell("npm install")
      }

      this.utils.shell("chmod +x build.sh deploy.sh undeploy.sh")

      this.utils.cd(this.project.options.workDir)

      if(this.project.processes) {
        this.project.processes.forEach((process) => {
          this.utils.shell(process.name)
        })
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

module.exports = PostProcessor
