const fs = require("fs")
const _ = require("lodash")
const os = require("os")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevHost {
  constructor(options) {
    this.options = options
    this.command = "host"

    this.operations = [
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

  updateHosts() {
    let content = `\
127.0.0.1	localhost
127.0.0.1	${os.hostname()}

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

    utils.message("updating /etc/hosts")
    fs.writeFileSync("/etc/hosts", content)
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

module.exports = ZeroDevHost
