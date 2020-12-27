const fs = require('fs')
const _ = require("lodash")
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateIndexHtml extends GenerateBase {
  constructor(project) {
    super(project)

    this.outputFile = `./${this.project.name}/public/index.html`
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
<!DOCTYPE html>
<html>
  <head>
    <title>${this.project.name}</title>
    <link rel="stylesheet" type="text/css" href="./css/main.css" />
    <link rel="shortcut icon" href="./images/favicon.ico?v=1" type="image/x-icon">

    <script src="https://preview.babylonjs.com/babylon.js"></script>
    <script src="https://preview.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
    <script src="https://preview.babylonjs.com/gui/babylon.gui.min.js"></script>
    <script src="https://code.jquery.com/pep/0.4.3/pep.js"></script>
  </head>
  <body style="margin:0;">
    <div id = "holder">
      <canvas id="appCanvas" touch-action="none"></canvas> <!-- touch-action="none" for best results from PEP -->
    </div>
    <div id="content"></div>

    <!-- Scenes -->
${this.getScenes()}

    <!-- Thermal Config -->
    <script src="./thermal/thermal-config.js"></script>

    <!-- Thermal Utilities -->
    <script src="./thermal/utils.js"></script>

    <!-- Thermal -->
    <script src="./thermal/thermal.js"></script>
  </body>
</html>
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

  getScenes() {
    let code = ""
    this.project.scenes.forEach((scene) => {
      code += `\
    <script src="./scenes/${_.kebabCase(scene.name)}.js"></script>
`
    })

    return code
  }
}

module.exports = GenerateIndexHtml
