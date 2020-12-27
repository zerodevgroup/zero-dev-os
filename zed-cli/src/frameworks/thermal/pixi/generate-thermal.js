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

    let type = "WebGL"
    if(!PIXI.utils.isWebGLSupported()) {
      type = "canvas"
    }

    PIXI.utils.sayHello(type)

    this.scenes = scenes
    this.defaultScene = defaultScene
  }

  renderScene(name) {
    let content = document.getElementById("content")

    this.sceneName = name
    window.location.hash = \`#\${name}\`

    let sceneConfig = this.scenes[name]

    let scene = eval(\`new \${name}(sceneConfig)\`)

    thermal.scene = scene

    content.innerHTML = ""
    content.append(scene.getScene())

    window.scrollTo(0,0)

    scene.render()
  }
}

let thermal = new Thermal()
thermal.renderScene(thermal.defaultScene)

// Detect hash change
window.onhashchange = () => {
  let newSceneName = location.hash.replace('#', '')
  if(thermal.sceneName != newSceneName) {
    thermal.switchView(newSceneName)
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
