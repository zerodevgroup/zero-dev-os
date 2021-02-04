const fs = require("fs")
const _ = require("lodash")
const os = require("os")
const shell = require("shelljs")
const moment = require("moment")

const utils = require("../utils/zero-dev-utils.js")

class WaveLightEvents {
  constructor(options) {
    this.options = options
    this.command = "events"

    this.operations = [
      "list",
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
    let events = JSON.parse(fs.readFileSync("/data/events.json"))

    let now = moment()
    utils.title(`Time: ${now.format("YYYY-MM-DD HH:mm:ss")}`)

    events.forEach((event) => {
      let eventStart = moment(new Date(event.startTime))
      let eventEnd = moment(new Date(event.endTime))

      if(eventEnd.isAfter(now)) {
        utils.subTitle(event.name)

        if(eventStart.isBefore(now)) {
          utils.message(`Ends ${now.to(eventEnd)}`)
        }
        else {
          utils.message(`Starts ${now.to(eventStart)}`)
        }

        utils.message(eventStart.format("YYYY-MM-DD HH:mm:ss"))
        utils.message(eventEnd.format("YYYY-MM-DD HH:mm:ss"))
      }
    })
  }

  //
  // Utility methods
  //

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
      utils.warn("no operations were specified")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/wli ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = WaveLightEvents
