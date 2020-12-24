const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevContainer {
  constructor(options) {
    this.options = options
    this.command = "container"

    // Set the default image to zero-dev-os unless otherwise specified
    if(!this.options.imageName) {
      this.options.imageName = "zero-dev-os"
    }

    console.log()
    utils.message("Options:")
    console.log(JSON.stringify(this.options, null, 2))

    this.validate()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      switch (this.options.operation) {
        case "list":
          this.list()
          resolve()
          break;
        case "create":
          this.create()
          resolve()
          break;
        case "delete":
          this.delete()
          resolve()
          break;
        case "stop":
          this.stop()
          resolve()
          break;
        case "start":
          this.start()
          resolve()
          break;
        case "restart":
          this.restart()
          resolve()
          break;
        default:
          utils.error(`operation ${this.options.operation} invalid, exiting...`);
          process.exit(-1)
      }
    })
    .catch((error) => {
      console.log(error)
      process.exit(-1)
    })

    return(promise)
  }

  list() {
    let command = `/snap/bin/lxc list`
    utils.message(command)

    let result = execSync(command)
    console.log(result.toString())
  }

  create() {
    let command = `/snap/bin/lxc launch ${this.options.imageName} ${this.options.containerName}`
    utils.message(command)

    let result = execSync(command)
    console.log(result.toString())
  }

  delete() {
    let deleteCommand = `/snap/bin/lxc delete --force ${this.options.containerName}`
    utils.message(deleteCommand)

    let deleteResult = execSync(deleteCommand)
    console.log(deleteResult.toString())
  }

  stop() {
    let command = `/snap/bin/lxc stop --force ${this.options.containerName}`
    utils.message(command)

    let result = execSync(command)
    console.log(result.toString())
  }

  start() {
    let command = `/snap/bin/lxc start ${this.options.containerName}`
    utils.message(command)

    let result = execSync(command)
    console.log(result.toString())
  }

  restart() {
    let stopCommand = `/snap/bin/lxc stop --force ${this.options.containerName}`
    utils.message(stopCommand)

    let stopResult = execSync(stopCommand)
    console.log(stopResult.toString())

    let startCommand = `/snap/bin/lxc start ${this.options.containerName}`
    utils.message(startCommand)

    let startResult = execSync(startCommand)
    console.log(startResult.toString())
  }

  validate() {
    let validOptions = true
    let messages = []

    if(!this.options.operation) {
      messages.push("--operation is required")
      validOptions = false
    }

    if(this.options.operation && this.options.operation != "list" && !this.options.containerName) {
      messages.push("--container-name is required")
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
      shell.exec(`${this.options.zeroDevOSDir}/zero-dev-os container --help`)

      process.exit(-1)
    }

  }
} 

module.exports = ZeroDevContainer
