const fs = require('fs')
const moment = require("moment")
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateDeploySh extends GenerateBase {
  constructor(project) {
    super(project);
    this.outputFile = `./${this.project.name}/deploy.sh`
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
      let year = moment().format("YYYY")
      let author = this.project.author ? this.project.author : this.project.name

      let code = `\
#!/bin/bash
date

echo "undeploying ..."
./undeploy.sh

echo "building ..."
./build.sh

pm2 start
pm2 save\
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

module.exports = GenerateDeploySh
