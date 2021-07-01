const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateModel extends GenerateBase {
  constructor(project) {
    super(project);

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

  search(callback) {
    let searchOptions = this.options.data
    let statement = \`select * from \${this.options.modelName} where \`

    let fields = {}
    this.schema.fields.forEach((field) => {
      fields[field.name] = field.field
    })

    let filters = []
    Object.keys(searchOptions.filters).forEach((filterKey) => {
      let searchOption = searchOptions.filters[filterKey]
      if(searchOption.value) {
        if(searchOption.filterOption === "startsWith") {
          filters.push(\`\${_.snakeCase(filterKey)} ilike '\${searchOption.value}%'\`)
        }

        if(searchOption.filterOption === "endsWith") {
          filters.push(\`\${_.snakeCase(filterKey)} ilike '%\${searchOption.value}'\`)
        }

        if(searchOption.filterOption === "group.endsWith") {
          let groupFilters = []
          searchOption.groupAttributes.forEach((groupAttribute) => {
            groupFilters.push(\`\${_.snakeCase(groupAttribute)} ilike '%\${searchOption.value}'\`)
          })

          let groupFilterStatement = "("
          groupFilters.forEach((groupFilter, index) => {
            if(index > 0) {
              groupFilterStatement += " or "
            }
            groupFilterStatement += groupFilter
          })
          groupFilterStatement += ")"

          filters.push(groupFilterStatement)
        }
      }
    })

    let sortItems = []
    Object.keys(searchOptions.sortItems).forEach((sortItemKey) => {
      let sortItem = searchOptions.sortItems[sortItemKey]
      sortItems.push(\`\${_.snakeCase(sortItemKey)} \${sortItem.order}\`)
    })

    filters.forEach((filter, index) => {
      if(index > 0) {
        statement += " and "
      }
      statement += filter
    })

    if(sortItems.length > 0) {
      statement += ' order by '
      sortItems.forEach((sortItem, index) => {
        if(index > 0) {
          statement += ", "
        }
        statement += sortItem
      })
    }

    let limit = searchOptions.limit ? searchOptions.limit : 100

    statement += \` limit \${limit}\`

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
          if(!item.id) {
            item.id = uuidv1()
          }
          createIds.push(item.id)

          let createSchema = {
            fields: [],
            columns: []
          }

          Object.keys(item).forEach((fieldName) => {
            if(!fieldName.match(/^undefined\$/) && schemaFields[fieldName]) {
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

            let value = item[fieldName] ? item[fieldName] : null

            if(dataType.match(/jsonb/) && typeof value === 'object' && value !== null) {
              value = JSON.stringify(value)
            }

            if(value === null) {
              statement += value
            }
            else if(dataType.match(/(varchar|date|timestamptz|jsonb)/)) {
              statement += "\$__\$" + value + "\$__\$"
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

    let updateFields = _.keyBy(this.schema.fields[this.options.modelName], "name")

    if(data) {
      let item = data
      let schemaFields = _.keyBy(this.schema.fields, "name")
      let statement = \`UPDATE \${this.options.modelName} SET \`

      let updateSchema = {
        fields: [],
        columns: []
      }

      Object.keys(item).forEach((fieldName) => {
        if(fieldName !== "id") {
          if(!fieldName.match(/^undefined\$/) && schemaFields[fieldName]) {
            updateSchema.fields.push(schemaFields[fieldName])
            updateSchema.columns.push(schemaFields[fieldName].field)
          }
        }
      });

      let fieldCount = 0
      updateSchema.fields.forEach((field) => {
        let column = field.field
        let fieldName = field.name
        let dataType = field.type

        if(fieldCount > 0) {
          statement += ", "
        }

        let value = item[fieldName] ? item[fieldName] : null

        if(dataType.match(/jsonb/) && typeof value === 'object' && value !== null) {
          value = JSON.stringify(value)
        }

        if(value === null) {
          statement += \`\${column} = \${value}\`
        }
        else if(dataType.match(/(varchar|date|timestamptz|jsonb)/)) {
          statement += \`\${column} = \$__\$\${value}\$__\$\`
        }
        else if(dataType.match(/(numeric|boolean)/)) {
          statement += \`\${column} = \${value}\`
        }

        fieldCount++
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
      let ids = ''
      data.data.forEach((item, index) => {
        if(index > 0) {
          ids += ','
        }
        ids += \`'\${item.id}'\` 
      })

      let statement = \`DELETE FROM \${this.options.modelName} WHERE id IN (\${ids})\`

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
