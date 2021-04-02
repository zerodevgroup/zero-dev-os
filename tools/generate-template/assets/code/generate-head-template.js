const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class __CLASS_NAME__ extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = `./${this.project.name}/__PATH__TO__FILE__`
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
