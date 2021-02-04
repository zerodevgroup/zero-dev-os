const GenerateBase = require("../../base/generate-base.js")

class Generator extends GenerateBase {
  constructor(project) {
    super(project)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.utils.title("Generator")

      console.log(`Generating for ${this.project.name}`)

      let generationFiles = this.getGenerationFiles(`${this.project.options.zeroDevOSDir}/dez-cli/src/frameworks/${this.project.framework.name}/files`)

      let executeCode = async () => {
        for(let i = 0; i < generationFiles.length; i++) {
          let generationFile = generationFiles[i]

          let generateClass = require(generationFile.path)
          await (new generateClass(this.project)).exec()
        }
      }

      executeCode()

      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }
}

module.exports = Generator
