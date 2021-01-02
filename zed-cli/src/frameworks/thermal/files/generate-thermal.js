const fs = require("fs")
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateThermal extends GenerateBase {
  constructor(project) {
    super(project)

    this.outputFile = `./${this.project.name}/public/thermal/thermal.js`
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
class Thermal {
  constructor() {
    console.log("Thermal is here!")
    this.config = new ThermalConfig()

    this.content = document.getElementById("content")
  }

  async switchView(name) {
    let view= eval(\`new \${name}()\`)
    this.content.innerHTML = ""
    this.content.append(view.getContent())
    window.scrollTo(0,0)
    view.animate()
  }

}

let thermal = new Thermal()
thermal.switchView(thermal.config.defaultView)
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

module.exports = GenerateThermal
