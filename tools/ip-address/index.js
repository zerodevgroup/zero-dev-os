const program = require("commander")
const shell = require("shelljs")
const fs = require("fs")
const IpAddress = require("./actions/ip-address")

program
  .description("Get Primary IP Address")
  .action((options) => {
    let ipAddress = new IpAddress({})

    ipAddress.exec()
  })

program.parse(process.argv)

