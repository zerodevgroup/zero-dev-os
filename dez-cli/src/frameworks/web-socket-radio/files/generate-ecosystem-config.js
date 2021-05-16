const fs = require('fs')
const moment = require("moment")
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateEcosystemConfig extends GenerateBase {
  constructor(project) {
    super(project);
    this.outputFile = `./${this.project.name}/ecosystem.config.js`
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.utils.subTitle(this.outputFile)
      this.generate().then(() => {
        resolve()
      })
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }

  generate() {
    let promise = new Promise((resolve, reject) => {

      let instances = this.project.instances ? this.project.instances : 1

      let code = `\
module.exports = {
  apps : [{
    name: "${this.project.name}",
    script: "src/app.js",
    args: "",
    instances: ${instances},
    autorestart: true,
    watch: false,
    max_memory_restart: "1G"
  }]
}
`

      fs.writeFileSync(this.outputFile, code)

      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }
}

module.exports = GenerateEcosystemConfig
