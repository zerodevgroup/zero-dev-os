const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateMainCss extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = `./${this.project.name}/public/css/main.css`
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
* { padding: 0; margin: 0; }
html, body, #content {
  font-family: "Roboto", sans-serif;
  min-height: 100% !important;
  height: 100%;
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 2px white;
}

button:hover {
  opacity: 0.8;
}

input {
  padding: 4px 8px;
  border-radius: 5px;
}

input:focus{
  outline: none;
  box-shadow: 0 0 0 2px white;
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

module.exports = GenerateMainCss
