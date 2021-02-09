const fs = require("fs")
const path = require("path")
const shell = require("shelljs")
const _ = require("lodash")

const GenerateBase = require("../../../base/generate-base.js")

class GenerateServices extends GenerateBase {
  constructor(project) {
    super(project)
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
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
      fs.readdir("config/data/schemas", (err, files) => {
        //handling error
        if (err) {
          return console.log('Unable to scan directory: ' + err)
        }

        files.forEach((file) => {
          this.generateModel(`config/data/schemas/${file}`)
        })
      })


      resolve()
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return promise
  }

  generateModel(file) {
    let schema = JSON.parse(fs.readFileSync(file))
    let appName = _.upperFirst(_.camelCase(this.project.name))

    let outputDirectory = `${this.project.name}/${appName}/src/app/models`
    if(!fs.existsSync(outputDirectory)) {
      this.utils.shell(`mkdir -p ${outputDirectory}`)
    }
    
    let fileName = _.kebabCase(schema.model)
    let className = _.upperFirst(_.camelCase(schema.model))
    let outputFile = `${outputDirectory}/${fileName}.ts`
    this.utils.subTitle(outputFile)

    let code = `\
export interface ${className} {\
`
    schema.fields.forEach((field) => {
      code += `
  ${field.name}: string;\
`
    })

    code += `
}\
`

    fs.writeFileSync(outputFile,code) 
  }
}

module.exports = GenerateServices
