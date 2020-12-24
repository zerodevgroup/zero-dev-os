const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevContainer {
  constructor(options) {
    this.options = options
    this.command = "container"

    this.imageName = "zero-dev-os"
    this.baseImage = "images:debian/buster"

    console.log()
    utils.message("Options:")
    console.log(this.options)

    this.operations = [
      "createOSImage",
      "list",
      "create",
      "delete",
      "start",
      "stop",
      "restart",
    ]

    this.validate()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.operations.forEach((operation) => {
        if(this.options[operation]) {
          this[operation]()
        }
      })

      resolve()

    })
    .catch((error) => {
      utils.error(error)
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
    let containerName = this.options.create
    let command = `/snap/bin/lxc launch ${this.imageName} ${containerName}`
    utils.message(command)

    let result = execSync(command)
    console.log(result.toString())
  }

  createOSImage() {
    let containerName = "zero-dev-os"

    // Update to latest zero-dev-os git repo commit
    utils.shell(`${this.options.zeroDevOSDir}/zero-dev-os update --git-repo`)

    // Delete any existing image/container
    utils.message("Clean up any existing images/containers")
    utils.shell(`/snap/bin/lxc image delete ${this.imageName}`)
    utils.shell(`/snap/bin/lxc stop ${containerName} --force`)
    utils.shell(`/snap/bin/lxc delete ${containerName} --force`)

    // Create container
    utils.message("Create container")
    utils.execSync(`/snap/bin/lxc launch ${this.baseImage} ${containerName}`)

    utils.shell(`/snap/bin/lxc exec ${containerName} -- mkdir -p ${this.options.home}/.ssh`)
    utils.shell(`/snap/bin/lxc exec ${containerName} -- mkdir -p /opt`)

    // Copy ssh keys if present
    if(fs.existsSync(`${this.options.home}/.ssh/id_rsa`)) {
      utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa ${containerName}/root/.ssh/id_rsa`)
      utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa.pub ${containerName}/root/.ssh/id_rsa.pub`)
      utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa.pub ${containerName}/root/.ssh/authorized_keys`)
    }
    // Wait for full boot of LXC container
    utils.message("Waiting for LXC container to boot...")
    setTimeout(() => {

      // Upgrade OS
      utils.shell(`/snap/bin/lxc exec ${containerName} -- apt update`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- apt --yes upgrade`)

      // Install zip, git
      utils.shell(`/snap/bin/lxc exec ${containerName} -- apt install --yes zip`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- apt install --yes git`)

      // copy zero-dev-os
      utils.shell(`/snap/bin/lxc file push --quiet -r ${this.options.zeroDevOSDir} ${containerName}/opt`)

      // install node
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/tools/node-js-install.sh`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zero-dev-os install --core`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zero-dev-os install --limit-swap`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zero-dev-os install --bashrc`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zero-dev-os install --vimrc`)

      // stop container
      utils.shell(`/snap/bin/lxc stop ${containerName} --force`)

      // publish image
      utils.shell(`/snap/bin/lxc publish --alias ${containerName} ${containerName} description="An image of ${containerName}"`)

      // remove container
      utils.shell(`/snap/bin/lxc delete ${containerName} --force`)
    })
  }

  delete() {
    let containerName = this.options.delete
    let deleteCommand = `/snap/bin/lxc delete --force ${containerName}`
    utils.message(deleteCommand)

    let deleteResult = utils.execSync(deleteCommand)
    console.log(deleteResult.toString())
  }

  stop() {
    let containerName = this.options.stop
    let command = `/snap/bin/lxc stop --force ${containerName}`
    utils.message(command)

    let result = execSync(command)
    console.log(result.toString())
  }

  start() {
    let containerName = this.options.start
    let command = `/snap/bin/lxc start ${containerName}`
    utils.message(command)

    let result = execSync(command)
    console.log(result.toString())
  }

  restart() {
    let containerName = this.options.restart
    let stopCommand = `/snap/bin/lxc stop --force ${containerName}`
    utils.message(stopCommand)

    let stopResult = execSync(stopCommand)
    console.log(stopResult.toString())

    let startCommand = `/snap/bin/lxc start ${this.options.containerName}`
    utils.message(startCommand)

    let startResult = execSync(startCommand)
    console.log(startResult.toString())
  }

  validate() {
    let validOptions = false
    let messages = []

    this.operations.forEach((operation) => {
      if(this.options[operation]) {
        validOptions = true
      }
    })

    if(!validOptions) {
      console.log()
      utils.warn("No operations were specified.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zero-dev-os ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevContainer
