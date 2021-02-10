const fs = require("fs")
const path = require("path")
const pluralize = require("pluralize")
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
          this.generateService(`config/data/schemas/${file}`)
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

  generateService(file) {
    let schema = JSON.parse(fs.readFileSync(file))
    let appName = _.upperFirst(_.camelCase(this.project.name))

    let outputDirectory = `${this.project.name}/${appName}/src/app/services`
    if(!fs.existsSync(outputDirectory)) {
      this.utils.shell(`mkdir -p ${outputDirectory}`)
    }

    // schema.model = "users"
    let pluralUpperName = _.toUpper(schema.model)
    let pluralFileName = _.kebabCase(schema.model)
    let pluralClassName = _.upperFirst(_.camelCase(schema.model))

    let modelName = pluralize.singular(schema.model)
    let fileName = _.kebabCase(modelName)
    let className = _.upperFirst(_.camelCase(modelName))

    let outputFile = `${outputDirectory}/${fileName}.service.ts`
    this.utils.subTitle(outputFile)

    let code = `\
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { ${className} } from '../models/${fileName}';
import { ${pluralUpperName} } from '../data/mock/${pluralFileName}';

@Injectable({
  providedIn: 'root'
})
export class ${className}Service {

  constructor() {
  }

  get${pluralClassName}(): Observable<${className}[]> {
    return of(${pluralUpperName});
  }
}\
`

    fs.writeFileSync(outputFile,code) 
  }
}

module.exports = GenerateServices
