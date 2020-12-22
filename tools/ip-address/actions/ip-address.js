const os = require("os")
const shell = require("shelljs")

class IpAddress {
  constructor(options) {
    this.options = options
  }

  exec() {
    console.log(this.getIpAddress())
  }

  getIpAddress() {
    let networkInterfacesDict = os.networkInterfaces()
    let ipv4Addresses = []

    Object.keys(networkInterfacesDict).forEach((key) => {
      let networkInterfaces = networkInterfacesDict[key]

      networkInterfaces.forEach((networkInterface) => {
        if(!networkInterface.internal) {
          if(networkInterface.family === "IPv4" && networkInterface.address.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
            let ipv4Address = Object.assign({}, networkInterface)
            ipv4Address.name = key
            ipv4Addresses.push(ipv4Address)
          }
        }
      })
    })

    let ipAddress = "0.0.0.0"
    let wlanAddress, ethAddress

    ipv4Addresses.forEach((ipv4Address) => {
      if(ipv4Address.name.match(/wlan[0-9]/)) {
        wlanAddress = ipv4Address.address
      }

      if(ipv4Address.name.match(/eth[0-9]/)) {
        ethAddress = ipv4Address.address
      }
    })

    if(wlanAddress) {
      ipAddress = wlanAddress
    }
    else if(ethAddress) {
      ipAddress = ethAddress
    }

    return ipAddress
  }
}

module.exports = IpAddress
