const fs = require('fs')
const shell = require("shelljs")
const _ = require("lodash")

const GenerateBase = require("../../../base/generate-base.js")

class GenerateApp extends GenerateBase {
  constructor(project) {
    super(project)

    this.outputFile = `./${this.project.name}/server.js`
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
      let description = this.project.description ? this.project.description : ""

      let appName = _.upperFirst(_.camelCase(this.project.name))
      let appWebDir = `${appName}/www`

      let code = `\
const express = require("express")
const cors = require("cors")
const app = express()

// Read config into env
const config = require("./config.json")
process.env = Object.assign(process.env, config)

const port = process.env.port

app.use(cors())

app.use(express.static("${appWebDir}"))

app.listen(port, () => console.log(\`app listening on port \${port}!\`))\
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

module.exports = GenerateApp
