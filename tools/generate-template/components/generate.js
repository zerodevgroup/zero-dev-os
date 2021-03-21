const shell = require("shelljs")
const fs = require("fs")
const _ = require("lodash")

class Generate {
  constructor(options) {
    this.options = options
    this.originalDirectory = process.env.PWD
    this.moduleDirectory = `${__dirname}/..`
  }

  exec() {
    let headTemplate = fs.readFileSync(`${this.moduleDirectory}/assets/code/generate-head-template.js`).toString()
    headTemplate = headTemplate.replace("__PATH__TO__FILE__", this.options.filePath)

    let tailTemplate = fs.readFileSync(`${this.moduleDirectory}/assets/code/generate-tail-template.js`).toString()

    let content = fs.readFileSync(this.options.inputFile).toString()
    content = content.replace(/\`/g, "\\`")
    content = content.replace(/\$/g, "\\$")

    let output = `${headTemplate}${content}${tailTemplate}`

    fs.writeFileSync(this.options.outputFile, output)
  }
} 

module.exports = Generate
