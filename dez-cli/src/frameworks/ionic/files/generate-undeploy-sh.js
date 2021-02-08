const fs = require('fs')
const moment = require("moment")
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateUndeploySh extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = `./${this.project.name}/undeploy.sh`
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
      let code = `\
#!/bin/bash
date

pm2 delete ${this.project.name}\
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

module.exports = GenerateUndeploySh
