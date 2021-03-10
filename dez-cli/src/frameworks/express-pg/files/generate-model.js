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
const { v1: uuidv1 } = require('uuid');
const { Client } = require("pg")

class Model {
  constructor(options) {
    this.options = options
    this.schema = JSON.parse(fs.readFileSync(\`./schemas/\${this.options.modelName}.json\`))
  }

  list(callback) {
    let statement = this.options.data.statement;

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
        let resultData = []
        result.rows.forEach((item) => {
          let resultItem = {}

          this.schema.fields.forEach((field) => {
            resultItem[field.name] = item[field.field] ? item[field.field] : ""
          })

          resultData.push(resultItem)
        })

        callback(resultData)
      }

      client.end()
    })
  }

  create(callback) {
    let data = this.options.data
    let schemaFields = _.keyBy(this.schema.fields, "name")

    let totalCount = 0
    let createIds = []
    if(data && data.length > 0) {
      try {
        const client = new Client()
        client.connect()

        let queries = []
        data.forEach((item) => {
          item.id = uuidv1()
          createIds.push(item.id)

          let createSchema = {
            fields: [],
            columns: []
          }

          Object.keys(item).forEach((fieldName) => {
            if(!fieldName.match(/^undefined$/) && schemaFields[fieldName]) {
              createSchema.fields.push(schemaFields[fieldName])
              createSchema.columns.push(schemaFields[fieldName].field)
            }
          });

          let statement = \`INSERT INTO \${this.schema.table} (\${createSchema.columns.join(",")}) VALUES(\`
          let fieldCount = 0
          createSchema.fields.forEach((field) => {
            let column = field.field
            let fieldName = field.name
            let dataType = field.type
            if(fieldCount > 0) {
              statement += ", "
            }

            let value = item[column] ? item[column] : null
            if(value === null) {
              statement += value
            }
            else if(dataType.match(/(varchar|date)/)) {
              statement += "$__$" + value + "$__$"
            }
            else if(dataType.match(/(numeric|boolean)/)) {
              statement += value
            }

            fieldCount++
          })

          statement += ")"

          queries.push(client.query(statement))
        })

        Promise.all(queries).then((results) => {
          results.forEach((result) => {
            totalCount += result.rowCount
          })

          callback({
            count: totalCount,
            createIds: createIds,
          })

          client.end()
        }).catch((error) => {
          callback({
            count: totalCount,
            error: error
          })
        })
      }
      catch(ex) {
        callback({
          count: totalCount,
          error: ex
        })
      }
    }
    else {
      callback({
        count: totalCount,
        error: "mising data attribute"
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
