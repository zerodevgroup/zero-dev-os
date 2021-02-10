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
    let pluralModelName = schema.model
    let pluralUpperName = _.toUpper(pluralModelName)
    let pluralFileName = _.kebabCase(pluralModelName)
    let pluralTableName = _.snakeCase(pluralModelName)
    let pluralClassName = _.upperFirst(_.camelCase(pluralModelName))

    let modelName = pluralize.singular(pluralModelName)
    let fileName = _.kebabCase(modelName)
    let className = _.upperFirst(_.camelCase(modelName))

    let outputFile = `${outputDirectory}/${fileName}.service.ts`
    this.utils.subTitle(outputFile)

    let code = `\
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ${className} } from '../models/${fileName}';
import { ${pluralUpperName} } from '../data/mock/${pluralFileName}';

@Injectable({
  providedIn: 'root'
})
export class ${className}Service {
  private apiUrl = '/goldenyears-api';

  httpOptions = {
    headers: new HttpHeaders({ 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'TOKEN': 'e4d98d50-6741-11eb-9cee-6d38aabde3c0',
    })
  };

  constructor(private http: HttpClient) {
  }

  /*
  get${pluralClassName}(): Observable<${className}[]> {
    return of(${pluralUpperName});
  }
  */

  get${pluralClassName}(): Observable<${className}[]> {
    let url = '/goldenyears-api/list/${pluralModelName}';
    let listOptions = {
      statement: 'select * from ${pluralTableName}'
    };
    return this.http.post<${className}[]>(url, listOptions, this.httpOptions).pipe(
      catchError(this.handleError<${className}[]>('get${className}'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(\`\${operation} failed: \${error.message}\`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}\
`

    fs.writeFileSync(outputFile,code) 
  }
}

module.exports = GenerateServices
