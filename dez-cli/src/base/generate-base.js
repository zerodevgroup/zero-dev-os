const fs = require("fs")
const _ = require("lodash")
const path = require("path")
const shell = require("shelljs")

class GenerateBase {
  constructor(project) {
    this.project = project

    this.utils = require(`${this.project.options.zeroDevOSDir}/dez-cli/src/utils/zero-dev-utils`)
  }

  getGenerationFiles(directory) {
    if(fs.existsSync(directory)) {
      let fileList = shell.exec(`find ${directory} -type f`, {silent:true}).stdout.split(/\n/)
      let files = []

      fileList.forEach((filePath) => {
        let fileName = path.basename(filePath)

        if(_.startsWith(fileName, "generate-")) {
          let name = fileName.replace(".js", "")
          let className = _.upperFirst(_.camelCase(name))

          files.push({
            path: filePath,
            fileName: fileName,
            name: name,
            className: className,
          })
        }
      })

      return(files)
    }
    else {
      return null
    }
  }
}

module.exports = GenerateBase
