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

  </head>
  <body style="margin:0;">
    <div id='content' style='height:100%'></div>

    <!-- External Libraries -->
    <script src="./libs/pixi.min.js"></script>

    <!-- Thermal Components -->
    <script src="./thermal/core/scene.js"></script>

    <!-- Thermal Utilities -->
    <script src="./thermal/utils.js"></script>

    <!-- Scenes -->
    <script src="./scenes.js"></script>

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
}

module.exports = GenerateIndexHtml
