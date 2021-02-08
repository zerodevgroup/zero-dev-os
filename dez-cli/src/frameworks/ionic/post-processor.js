const fs = require("fs")
const shell = require("shelljs")
const _ = require("lodash")
const GenerateBase = require("../../base/generate-base.js")

class PostProcessor extends GenerateBase {
  constructor(project) {
    super(project)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.utils.title("PostProcessor")

      // Grab assets
      if(this.project.assets && fs.existsSync(`${this.project.assets}`)) {
        this.utils.shell(`cp -r ${this.project.assets}/* ./${this.project.name}`)
      }

      // Remove un-needed artifacts from ionic template
      if(fs.existsSync(`./${this.project.name}/${this.project.appName}/src/app/folder`)) {
        this.utils.shell(`rm -rf ./${this.project.name}/${this.project.appName}/src/app/folder`)
      }

      if(this.project.postProcesses) {
        this.project.postProcesses.forEach((process) => {
          this.utils.shell(process.name)
        })
      }

      this.utils.cd(`${this.project.options.workDir}/${this.project.name}`)

      if(!fs.existsSync(`node_modules`)) {
        this.utils.shell("npm install")
      }

      this.utils.shell("chmod +x build.sh deploy.sh undeploy.sh")

      this.utils.cd(`${this.project.options.workDir}/${this.project.name}/${this.project.appName}`)

      if(!fs.existsSync(`node_modules`)) {
        this.utils.shell("npm install")
      }

      if(!fs.existsSync(`www`)) {
        this.utils.shell("ionic build")
      }

      /*
      // TODO: Use this.project.options to determine if the following should be executed (i.e. default to web only)
      if(!fs.existsSync(`ios`)) {
        this.utils.shell("ionic capacitor add ios")
      }

      if(!fs.existsSync(`android`)) {
        this.utils.shell("ionic capacitor add android")
      }
      */

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
