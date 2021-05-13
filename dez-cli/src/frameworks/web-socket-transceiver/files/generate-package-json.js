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
      let description = this.project.description ? this.project.description : this.project.name
      let version = this.project.version ? this.project.version : "1.0.0"
      let repo = this.project.repo ? this.project.repo : ""
      let author = this.project.author ? this.project.author : ""
      let license = this.project.license ? this.project.license : "MIT"

      let code = `\
{
  "name": "${this.project.name}",
  "version": "${version}",
  "description": "${description}",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "${repo}"
  },
  "keywords": [],
  "author": "${author}",
  "license": "${license}",
  "bugs": {
    "url": "${repo}"
  },
  "homepage": "${repo}",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "lodash": "^4.17.15",
    "moment": "^2.24.0",
    "mongodb": "^3.4.1",
    "request": "^2.88.0",
    "stripe": "^8.2.0"
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
