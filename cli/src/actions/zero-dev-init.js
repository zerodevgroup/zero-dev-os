const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevInit {
  constructor(options) {
    this.options = options
    this.command = "init"

    utils.message("Options")
    console.log(this.options)
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

module.exports = ZeroDevInit
