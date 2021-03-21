const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateGitignore extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = `./${this.project.name}/src/app.js`
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
// Read config into env
const config = require("../config.json")
const nodeEnvironment = process.env.NODE_ENV || "dev"
const env = config[nodeEnvironment]
process.env = Object.assign(process.env, env)

const oodaLoop = () => {
  // Read business rules

  // Query data for matching data

  // Apply decision analytics

  // Take action

  setTimeout(oodaLoop, process.env.waitMilliseconds)
}

console.log(\`Running oodaLoop with wait of \${process.env.waitMilliseconds}ms\`)
oodaLoop()
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

module.exports = GenerateGitignore
