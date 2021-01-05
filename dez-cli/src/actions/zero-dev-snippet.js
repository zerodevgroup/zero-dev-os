const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevSnippet {
  constructor(options) {
    this.options = options
    this.command = "snippet"

    this.options.generateFileName = `generate-${this.options.baseName}.js`
    this.options.className = _.upperFirst(_.camelCase(this.options.baseName))

    console.log()
    utils.message("Options:")
    console.log(this.options);

    this.validate()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      let recipe = this.options.recipe

      if(this[recipe]) {
        utils.title(recipe)
        this[recipe]()
      }
      else {
        utils.error(`recipe ${this.options.recipe} invalid, exiting...`);
      }
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  generateClassFile() {
    let promise = new Promise((resolve, reject) => {
      utils.subTitle(this.options.generateFileName)

      let code = `\
const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class Generate${this.options.className} extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = \`./\${this.project.name}/src/${this.options.baseName}.js\`
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      utils.subTitle(this.outputFile)
      this.generate().then(() => {
        resolve()
      })
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return promise
  }

  generate() {
    let promise = new Promise((resolve, reject) => {
      let description = this.project.description ? this.project.description : ""

      let code = \`\\
class ${this.options.className} {
  constructor(options) {
    this.options = options
  }
}

module.exports = ${this.options.className}\\
\`
      console.log(code)
      fs.writeFileSync(this.outputFile, code)

      resolve()
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return promise
  }
}

module.exports = Generate${this.options.className}\
`
      fs.writeFileSync(this.options.generateFileName, code)

      resolve()
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  generateReadme() {
    let promise = new Promise((resolve, reject) => {
      utils.subTitle(this.options.generateFileName)

      let code = `\
const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateReadme extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = \`./\${this.project.name}/README.md\`
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      utils.subTitle(this.outputFile)
      this.generate().then(() => {
        resolve()
      })
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return promise
  }

  generate() {
    let promise = new Promise((resolve, reject) => {
      let description = this.project.description ? this.project.description : ""

      let code = \`\\
# \${this.project.name}
\${description}\\
\`
      console.log(code)
      fs.writeFileSync(this.outputFile, code)

      resolve()
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return promise
  }
}

module.exports = GenerateReadme\
`
      fs.writeFileSync(this.options.generateFileName, code)

      resolve()
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  validate() {
    let validOptions = true
    let messages = []

    if(!this.options.recipe) {
      messages.push("--recipe is required")
      validOptions = false
    }

    if(!this.options.baseName) {
      messages.push("--base-name is required")
      validOptions = false
    }

    if(!validOptions) {
      console.log()
      utils.message("Hmmm...")

      messages.forEach((message) => {
        utils.error(message)
      })

      console.log()
      utils.message("Please resolve and try again.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/dez ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevSnippet
