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
    <link rel="shortcut icon" href="./images/favicon.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="content"></div>

    <!-- Views -->
${this.getViews()}

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

  getViews() {
    let code = ""
    this.project.views.forEach((view) => {
      code += `\
    <script src="./views/${_.kebabCase(view.name)}.js"></script>
`
    })

    return code
  }
}

module.exports = GenerateIndexHtml
