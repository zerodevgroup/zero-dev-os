const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GeneratePackageJson extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = `./${this.project.name}/package.json`
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
{
  "name": "storm-front-radio",
  "version": "1.0.0",
  "description": "storm-front-radio",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/zerodevgroup/storm-front"
  },
  "keywords": [],
  "author": "zerodevgroup",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/zerodevgroup/storm-front"
  },
  "homepage": "https://github.com/zerodevgroup/storm-front",
  "dependencies": {
    "lodash": "^4.17.21",
    "moment": "^2.29.1",
    "socket.io": "^4.1.1",
    "socket.io-redis": "^6.1.0"
  }
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

module.exports = GeneratePackageJson
