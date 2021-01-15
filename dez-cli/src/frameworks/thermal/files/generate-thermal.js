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
    this.view = null
  }

  async switchView(name) {
    let className = this.upperFirst(name)

    window.location.hash = \`#\${className}\`

    let view= eval(\`new \${className}()\`)
    this.view = view

    this.content.innerHTML = ""
    this.content.append(view.getContent())

    window.scrollTo(0,0)
    view.animate()
  }

  upperFirst(text) {
    let value = text[0].toUpperCase() +  text.slice(1).toLowerCase()

    return value
  }

}

let thermal = new Thermal()
thermal.switchView(thermal.config.defaultView)

// Detect hash change
window.onhashchange = () => {
  let viewName = thermal.view.name.toLowerCase()
  let locationName = location.hash.replace('#', '').toLowerCase()
  if(viewName != locationName) {
    thermal.switchView(locationName)
  }
}
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
