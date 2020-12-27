const fs = require("fs")
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateUtils extends GenerateBase {
  constructor(project) {
    super(project)

    this.outputFile = `./${this.project.name}/public/thermal/utils.js`
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.utils.subTitle(this.outputFile)
      this.generate().then(() => {
        resolve()
      })
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }

  generate() {
    let promise = new Promise((resolve, reject) => {
      let description = this.project.description ? this.project.description : ""

      let code = `\
class Utils {
  // Convert from degrees to radians.
  static radians(degrees) {
    return degrees * Math.PI / 180
  }

  // Convert from radians to degrees.
  static degrees(radians) {
    return radians * 180 / Math.PI
  }
}\
`
      fs.writeFileSync(this.outputFile, code)

      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }
}

module.exports = GenerateUtils
