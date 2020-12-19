const fs = require("fs")
const _ = require("lodash")
const ComponentBase = require("../base/component-base.js")

class ZeroDevContainerOS extends ComponentBase {
  constructor(options) {
    super(options)
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
    this.utils.message("Options:")
    console.log(this.options)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      // Delete any existing image/container
      this.utils.message("Clean up any existing images/containers")
      this.utils.shell(`/snap/bin/lxc image delete ${this.options.imageName}`)
      this.utils.shell(`/snap/bin/lxc stop ${this.options.containerName} --force`)
      this.utils.shell(`/snap/bin/lxc delete ${this.options.containerName} --force`)

      // Create container
      this.utils.message("Create container")
      this.utils.execSync(`/snap/bin/lxc launch ${this.options.baseImage} ${this.options.containerName}`)

      this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- mkdir -p ${this.options.home}/.ssh`)
      this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- mkdir -p /opt`)

      // Copy ssh keys if present
      if(fs.existsSync(`${this.options.home}/.ssh/id_rsa`)) {
        this.utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa ${this.options.containerName}/root/.ssh/id_rsa`)
        this.utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa.pub ${this.options.containerName}/root/.ssh/id_rsa.pub`)
        this.utils.shell(`/snap/bin/lxc file push ${this.options.home}/.ssh/id_rsa.pub ${this.options.containerName}/root/.ssh/authorized_keys`)
      }
      // Wait for full boot of LXC container
      this.utils.message("Waiting for LXC container to boot...")
      setTimeout(() => {

        // Upgrade OS
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt update`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt --yes upgrade`)

        // Install zip, git
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes zip`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes git`)

        // copy zero-dev-os
        this.utils.shell(`/snap/bin/lxc file push --quiet -r ${this.options.zeroDevOSDir} ${this.options.containerName}/opt`)

        // install node
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/tools/node-js-install.sh`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os.sh install --core`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os.sh install --limit-swap`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os.sh install --bashrc`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /opt/zero-dev-os/zero-dev-os.sh install --vimrc`)

        // stop container
        this.utils.shell(`/snap/bin/lxc stop ${this.options.containerName} --force`)

        // publish image
        this.utils.shell(`/snap/bin/lxc publish --alias ${this.options.containerName} ${this.options.containerName} description="An image of ${this.options.containerName}"`)

        // remove container
        this.utils.shell(`/snap/bin/lxc delete ${this.options.containerName} --force`)

        resolve()

      }, 10000)
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }
} 

module.exports = ZeroDevContainerOS
