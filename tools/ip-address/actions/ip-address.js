const os = require("os")

class IpAddress {
  exec() {
    // Output ip address to stdout
    console.log(this.getIpAddress())
  }

  getIpAddress() {
    let networkInterfacesDict = os.networkInterfaces()
    let ipv4Addresses = []

    // Set initial ip address
    let ipAddress = "0.0.0.0"

    // Arrays to hold ip addresses by type (wlan/eth)
    let wlanAddresses = []
    let ethAddresses = []

    // Loop over all network interfaces
    // Organize ip addresses by wlanAddresses/ethAddresses
    Object.keys(networkInterfacesDict).forEach((key) => {
      let networkInterfaces = networkInterfacesDict[key]

      networkInterfaces.forEach((networkInterface) => {
        // Omit internal addresses
        if(!networkInterface.internal) {
          // Look for IPv4 addresses
          if(networkInterface.family === "IPv4" && networkInterface.address.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
            let ipv4Address = Object.assign({}, networkInterface)

            ipv4Address.name = key

            // wlan addresses
            if(ipv4Address.name.match(/wlan[0-9]/)) {
              wlanAddresses.push(ipv4Address.address)
            }

            // eth addresses
            if(ipv4Address.name.match(/eth[0-9]/)) {
              ethAddresses.push(ipv4Address.address)
            }
          }
        }
      })
    })

    // Select the first address, preferring wlan over eth
    if(wlanAddresses) {
      ipAddress = wlanAddresses[0]
    }
    else if(ethAddresses) {
      ipAddress = ethAddress[0]
    }

    return ipAddress
  }
}

module.exports = IpAddress
