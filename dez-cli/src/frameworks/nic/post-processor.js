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

      if(this.project.postProcesses) {
        this.project.postProcesses.forEach((process) => {
          this.utils.shell(process.name)
        })
      }

      this.utils.cd(`${this.project.options.workDir}/${this.project.name}`)

      if(!fs.existsSync(`node_modules`)) {
        this.utils.shell("npm install")
      }

      if(!fs.existsSync(`www`)) {
        this.utils.shell("ionic build")
      }

      if(!fs.existsSync(`ios`)) {
        this.utils.shell("ionic capacitor add ios")
      }

      if(!fs.existsSync(`android`)) {
        this.utils.shell("ionic capacitor add android")
      }

      this.utils.shell("chmod +x build.sh")

      this.utils.cd(this.project.options.workDir)
       
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