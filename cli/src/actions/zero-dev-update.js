const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")
const ComponentBase = require("../base/component-base.js")

class ZeroDevUpdate extends ComponentBase {
  constructor(options) {
    super(options);
    this.command = "update"

    this.utils.message("Options")
    console.log(this.options);
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }
} 

module.exports = ZeroDevUpdate
