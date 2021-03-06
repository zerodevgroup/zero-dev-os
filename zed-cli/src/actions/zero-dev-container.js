const fs = require("fs")
const _ = require("lodash")
const os = require("os")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevContainer {
  constructor(options) {
    this.options = options
    this.command = "container"

    this.imageName = "zero-dev-os"
    this.baseImage = "ubuntu:20.10"

    this.operations = [
      "list",
      "create",
      "delete",
      "start",
      "stop",
      "restart",
      "createOSImage",
      "updateHosts",
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
    utils.shell(`${this.options.zeroDevOSDir}/zed update --git-repo`)

    // Delete any existing image/container
    utils.message("clean up any existing images/containers")
    utils.shell(`/snap/bin/lxc image delete ${this.imageName}`)
    utils.shell(`/snap/bin/lxc stop ${containerName} --force`)
    utils.shell(`/snap/bin/lxc delete ${containerName} --force`)

    // Create container
    utils.message("create container")
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
    utils.message("waiting for lxc container to boot...")
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
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zed install --core`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zed install --limit-swap`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zed install --bashrc`)
      utils.shell(`/snap/bin/lxc exec ${containerName} -- /opt/zero-dev-os/zed install --vimrc`)

      // stop container
      utils.shell(`/snap/bin/lxc stop ${containerName} --force`)

      // publish image
      utils.shell(`/snap/bin/lxc publish --alias ${containerName} ${containerName} description="${containerName}"`)

      // remove container
      utils.shell(`/snap/bin/lxc delete ${containerName} --force`)
    }, 30000)
  }

  delete() {
    let containerName = this.options.delete
    let deleteCommand = `/snap/bin/lxc delete --force ${containerName}`

    let deleteResult = utils.execSync(deleteCommand)
    console.log(deleteResult.toString())
  }

  stop() {
    let containerName = this.options.stop
    let command = `/snap/bin/lxc stop --force ${containerName}`

    let result = utils.execSync(command)
    console.log(result.toString())
  }

  start() {
    let containerName = this.options.start
    let command = `/snap/bin/lxc start ${containerName}`
    utils.message(command)

    let result = utils.execSync(command)
    console.log(result.toString())
  }

  restart() {
    let containerName = this.options.restart
    let stopCommand = `/snap/bin/lxc stop --force ${containerName}`

    let stopResult = utils.execSync(stopCommand)
    console.log(stopResult.toString())

    let startCommand = `/snap/bin/lxc start ${containerName}`

    let startResult = utils.execSync(startCommand)
    console.log(startResult.toString())
  }

  updateHosts() {
    let containerName = this.options.updateHosts

    let content = `\
127.0.0.1	localhost
127.0.0.1	${containerName}

`

    if(this.options.multipass) {
      let containers = JSON.parse(shell.exec("multipass list --format json", {silent:true}).stdout)

      containers.list.forEach((container) => {
        if(container.state.match(/running/i)) {
          console.log(container.name)

          if(container.ipv4 && container.ipv4.length > 0) {
            let address = container.ipv4[0]
            console.log(address)
            content += `${address} ${container.name}\n`
          }
        }
      })
    }
    else {
      let containers = JSON.parse(shell.exec("lxc list --format json", {silent:true}).stdout)

      containers.forEach((container) => {
        if(container.status.match(/running/i)) {
          console.log(container.name)

          if(container.state && container.state.network && container.state.network.eth0 && container.state.network.eth0.addresses && container.state.network.eth0.addresses.length > 0) {
            container.state.network.eth0.addresses.forEach((address) => {
              if(address.family === "inet") {
                console.log(address)
                content += `${address.address} ${container.name}\n`
              }
            })
          }
        }
      })
    }

    content += `
# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
`

    utils.message("updating /tmp/hosts")
    fs.writeFileSync("/tmp/hosts", content)

    // write /tmp/hosts to container /etc/hosts
    shell.exec(`scp /tmp/hosts root@${containerName}:/etc/hosts`)
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
      utils.warn("no operations were specified...")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zed ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevContainer
