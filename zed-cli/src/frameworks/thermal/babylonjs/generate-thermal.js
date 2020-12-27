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

    this.canvas = document.getElementById("appCanvas")
    this.content = document.getElementById("content")
    this.engine = new BABYLON.Engine(this.canvas, true)
    this.scene = new BABYLON.Scene(this.engine)
  }

  async render() {
    await this.switchScene(this.config.defaultScene)

    // Register a render loop to repeatedly render the scene
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })

    // Watch for browser/canvas resize events
    window.addEventListener("resize", () => {
      this.engine.resize()
    })
  }

  async switchScene(name) {
    this.engine.displayLoadingUI()

    this.scene.detachControl()

    let sceneContainer = eval(\`new \${name}()\`)
    this.content.innerHTML = ""
    this.content.append(sceneContainer.getContent())

    const scene = sceneContainer.getScene()

    await scene.whenReadyAsync()

    this.engine.hideLoadingUI()

    this.scene.dispose()
    this.scene = scene
  }

}

let thermal = new Thermal()
thermal.render()
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
