const fs = require("fs")
const _ = require("lodash")
const utils = require("../utils/zero-dev-utils.js")

class ZeroDevContainerOS {
  constructor(options) {
    this.options = options
    this.command = "os"

    // Set the default base image to debian/buster unless otherwise specified
    if(!this.options.baseImage) {
      this.options.baseImage = "ubuntu:20.04"
    }

    // Set the default image to zero-dev-os unless otherwise specified
    if(!this.options.imageName) {
      this.options.imageName = "zero-dev-os"
    }

    // Set containerName for code readability
    this.options.containerName = this.options.imageName

    console.log()
    utils.message("Options:")
    console.log(this.options)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      // Delete any existing image/container
      utils.message("Clean up any existing images/containers")
      utils.shell(`/snap/bin/lxc image delete ${this.options.imageName}`)
      utils.shell(`/snap/bin/lxc stop ${this.options.containerName} --force`)
      utils.shell(`/snap/bin/lxc delete ${this.options.containerName} --force`)

      // Create container
      utils.message("Create container")
      utils.execSync(`/snap/bin/lxc launch ${this.options.baseImage} ${this.options.containerName}`)

      utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- mkdir -p ${this.options.home}/.ssh`)
      utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- mkdir -p /opt`)

      // Copy ssh keys if present
      if(fs.existsSync(`${this.options.home}/.ssh/id_rsa`)) {
        utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa ${this.options.containerName}/root/.ssh/id_rsa`)
        utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa.pub ${this.options.containerName}/root/.ssh/id_rsa.pub`)
        utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa.pub ${this.options.containerName}/root/.ssh/authorized_keys`)
      }
      // Wait for full boot of LXC container
      utils.message("Waiting for LXC container to boot...")
      setTimeout(() => {

        // Upgrade OS
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt update`)
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt --yes upgrade`)

        // Install zip, git
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes zip`)
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes git`)

        // copy zero-dev-os
        utils.shell(`/snap/bin/lxc file push --quiet -r ${this.options.zeroDevOSDir} ${this.options.containerName}/opt`)

        // install node
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/tools/node-js-install.sh`)
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os install --core`)
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os install --limit-swap`)
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os install --bashrc`)
        utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os install --vimrc`)

        // stop container
        utils.shell(`/snap/bin/lxc stop ${this.options.containerName} --force`)

        // publish image
        utils.shell(`/snap/bin/lxc publish --alias ${this.options.containerName} ${this.options.containerName} description="An image of ${this.options.containerName}"`)

        // remove container
        utils.shell(`/snap/bin/lxc delete ${this.options.containerName} --force`)

        resolve()

      }, 10000)
    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }
} 

module.exports = ZeroDevContainerOS
