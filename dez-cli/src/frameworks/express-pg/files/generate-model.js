const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateModel extends GenerateBase {
  constructor(project) {
    super(project)
    this.outputFile = `./${this.project.name}/src/components/model.js`
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

      let code = `\
const fs = require("fs")
const _ = require("lodash")
const uuid = require("uuid/v1")
const { Client } = require("pg")

class Model {
  constructor(options) {
    this.options = options
    this.fields = JSON.parse(fs.readFileSync("../tools/migrate-data/fields.json"))
  }

  list(callback) {
    let statement = this.options.statement;

    const client = new Client()
    client.connect()
    client.query(statement, (error, result) => {
      if(error) {
        callback({
          count: 0,
          data: [],
          error: error
        })
      }
      else {
        callback({
          count: result.rowCount,
          data: result.rows
        })
      }
      client.end()
    })
  }

  create(callback) {
    let data = this.options.data
    let createFields = _.keyBy(this.fields[this.options.modelName], "name")

    console.log("Create...")
    console.log(this.options.modelName)
    console.log(data)
    console.log(createFields)

    if(data.data && data.data.length > 0) {
      let item = data.data[0]
      item.id = uuid()

      let columns = []
      Object.keys(item).forEach((key) => {
        let fieldName = _.camelCase(key)
        if(!key.match(/^undefined$/) && createFields[fieldName]) {
          columns.push(key)
        }
      });

      console.log(columns)

      let statement = \`INSERT INTO \${this.options.modelName} (\${columns.join(",")}) VALUES(\`
      let fieldCount = 0
      columns.forEach((column) => {
        let fieldName = _.camelCase(column)
        let dataType = createFields[fieldName].type
        if(fieldCount > 0) {
          statement += ", "
        }

        if(dataType.match(/(varchar|date)/)) {
          statement += "$__$" + item[column] + "$__$"
        }
        else if(dataType.match(/(numeric|boolean)/)) {
          statement += \`\${item[column]}\`
        }

        fieldCount++
      })

      statement += ")"
      console.log(statement)

      const client = new Client()
      client.connect()
      client.query(statement, (error, result) => {
        if(error) {
          callback({
            count: 0,
            data: [],
            error: error
          })
        }
        else {
          callback({
            count: result.rowCount,
            data: item,
            statement: statement
          })
        }
        client.end()
      })
    }
  }

  update(callback) {
    let data = this.options.data
    let updateFields = _.keyBy(this.fields[this.options.modelName], "name")

    console.log("Update...")
    console.log(this.options.modelName)
    console.log(data)
    console.log(updateFields)

    if(data.data && data.data.length > 0) {
      let item = data.data[0]
      let statement = \`UPDATE \${this.options.modelName} SET \`
      let fieldCount = 0
      Object.keys(item).forEach((key) => {
        let fieldName = _.camelCase(key)
        if(!fieldName.match(/(id|undefined)/) && updateFields[fieldName]) {
          let dataType = updateFields[fieldName].type
          if(fieldCount > 0) {
            statement += ", "
          }

          if(dataType.match(/(varchar|date)/)) {
            statement += key + " = " + "$__$" + item[key] + "$__$"
          }
          else if(dataType.match(/(numeric|boolean)/)) {
            statement += \`\${key} = \${item[key]}\`
          }

          fieldCount++
        }
      })

      statement += \` WHERE id = '\${item.id}'\`
      console.log(statement)

      const client = new Client()
      client.connect()
      client.query(statement, (error, result) => {
        if(error) {
          callback({
            count: 0,
            data: [],
            error: error
          })
        }
        else {
          callback({
            count: result.rowCount,
            data: item,
            statement: statement
          })
        }
        client.end()
      })
    }
  }

  delete(callback) {
    let data = this.options.data

    console.log("Delete...")
    console.log(this.options.modelName)
    console.log(data)

    if(data.data && data.data.length > 0) {
      let item = data.data[0]
      let statement = \`DELETE FROM \${this.options.modelName} WHERE id = '\${item.id}'\`

      console.log(statement)

      const client = new Client()
      client.connect()
      client.query(statement, (error, result) => {
        if(error) {
          callback({
            count: 0,
            data: [],
            error: error
          })
        }
        else {
          callback({
            count: result.rowCount,
            data: result.rows,
            statement: statement
          })
        }
        client.end()
      })
    }
  }

}

module.exports = Model
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

module.exports = GenerateModel
