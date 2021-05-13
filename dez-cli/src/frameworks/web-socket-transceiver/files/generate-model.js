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
const ObjectId = require("mongodb").ObjectID
const mongo = require("mongodb")

class Model {
  constructor(options) {
    this.options = options
  }

  list(callback) {
    // DB Connection
    mongo.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then((client) => {
      let db = client.db(process.env.mongoDatabase)

      let modelName = this.options.modelName
      let options = this.options.data

      try {
        // Get the documents collection
        var collection = db.collection(modelName)

        let idFind = {}
        if(options.hasOwnProperty("find") && options.find.hasOwnProperty("_id")) {

          let objectId = new ObjectId(options.find._id)
          idFind = {
            _id: { $in: [ options.find._id, objectId ] }
          }
        }

        let regexFind = {}
        // Enable regex if requested
        if(options.hasOwnProperty("find")) {
          Object.keys(options.find).forEach((key) => {
            if(key !== "_id") {
              regexFind[key] = { 
                $regex: options.find[key],
                $options: "i" 
              }
            }
          })
        }

        let textSearch = {}
        // Enable text search if requested
        if(options.search && options.search.value && options.search.value.length > 0) {
          textSearch["$text"] = { 
            $search: options.search.value
          }
        }

        let findOptions = Object.assign({}, idFind, regexFind, textSearch)

        let pageIndex = 0
        if(options.hasOwnProperty("page")) {
          pageIndex = parseInt(options.page - 1)
        }

        let sortOptions = {}
        if(options.hasOwnProperty("sort")) {
          sortOptions = options.sort
        }

        console.log({
          findOptions: findOptions,
          sortOptions: sortOptions
        })

        let data = collection.find(findOptions, {sort: sortOptions})

        data.count((countError, count) => {
          //let limit = process.env.pagination.itemsPerPage
          let limit = 10

          if(options.hasOwnProperty("limit")) {
            limit = options.limit
          }

          let numberOfPages = Math.ceil(count / limit)
          let skipCount = limit * pageIndex

          let returnData = {
            page: options.page,
            totalCount: count,
            skipCount: skipCount,
            numberOfPages: numberOfPages,
            itemsPerPage: limit
          }

          data.skip(skipCount).limit(limit).toArray((err, result) => {
            returnData.docs = result
            client.close()
            callback(returnData)
          })
        })
      }
      catch(error) {
        console.log({
          error: error,
          find: options.find
        })

        callback({
          error: error.message
        })

        if(client != null) {
          client.close()
        }
      }
    })
  }

  find(callback) {
    // DB Connection
    mongo.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then((client) => {
      let db = client.db(process.env.mongoDatabase)

      let modelName = this.options.modelName
      let options = this.options.data

      try {
        // Get the documents collection
        var collection = db.collection(modelName)

        let findOptions = options.find

        if(options.hasOwnProperty("find") && options.find.hasOwnProperty("_id")) {
          let objectId = new ObjectId(options.find._id)
          let idFind = {
            _id: { $in: [ options.find._id, objectId ] }
          }

          findOptions = idFind
        }

        let pageIndex = 0
        if(options.hasOwnProperty("page")) {
          pageIndex = parseInt(options.page - 1)
        }

        let sortOptions = {}
        if(options.hasOwnProperty("sort")) {
          sortOptions = options.sort
        }

        console.log({
          findOptions: findOptions,
          sortOptions: sortOptions
        })

        let data = collection.find(findOptions, {sort: sortOptions})

        data.count((countError, count) => {
          //let limit = process.env.pagination.itemsPerPage
          let limit = 10

          if(options.hasOwnProperty("limit")) {
            limit = options.limit
          }

          let numberOfPages = Math.ceil(count / limit)
          let skipCount = limit * pageIndex

          let returnData = {
            page: options.page,
            totalCount: count,
            skipCount: skipCount,
            numberOfPages: numberOfPages,
            itemsPerPage: limit
          }

          data.skip(skipCount).limit(limit).toArray((err, result) => {
            returnData.docs = result
            client.close()
            callback(returnData)
          })
        })
      }
      catch(error) {
        console.log({
          error: error,
          find: options.find
        })

        callback({
          error: error.message
        })

        if(client != null) {
          client.close()
        }
      }
    })
  }

  create(callback) {
    // DB Connection
    mongo.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then((client) => {
      let db = client.db(process.env.mongoDatabase)

      try {
        // Get the documents collection
        let collection = db.collection(this.options.modelName)

        // Insert data
        collection.insertMany(this.options.data, (err, data) => {
          if(err) {
            console.log(err)
          }

          callback(data)
        })
      }
      catch(error) {
        console.log({
          error: error
        })

        callback({
          error: error.message
        })

        if(client != null) {
          client.close()
        }
      }
    })
  }

  update(callback) {
    let modelName = this.options.modelName
    let options = this.options

    // DB Connection
    mongo.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then((client) => {
      let db = client.db(process.env.mongoDatabase)

      try {
        // Get the documents collection
        var collection = db.collection(modelName)

        if(options.hasOwnProperty("data") && options.data.hasOwnProperty("_id")) {
          let objectId = ObjectId(options.data._id)

          let updateOptions = {
            _id: objectId
          }

          // Delete _id in the data for the update
          if(options.data.hasOwnProperty("_id")) {
            delete options.data._id
          }

          collection.findOneAndUpdate(updateOptions, { $set: options.data }, (err, data) => {
            if(err) {
              console.log(err)

              client.close()
              callback({
                error: err
              })
            }
            else {
              client.close()
              callback(data)
            }
          })
        }
        else {
          client.close()
          callback(null)
        }
      }
      catch(error) {
        console.log({
          error: error.message
        })

        callback({
          error: error.message
        })

        if(client != null) {
          client.close()
        }
      }
    })
  }

  delete(callback) {
    let modelName = this.options.modelName
    let options = this.options

    // DB Connection
    mongo.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then((client) => {
      let db = client.db(process.env.mongoDatabase)

      try {
        // Get the documents collection
        var collection = db.collection(modelName)

        if(options.hasOwnProperty("data") && options.data.hasOwnProperty("_id")) {
          let objectId = ObjectId(options.data._id)

          let deleteOptions = {
            _id: objectId
          }

          // Remove and return a document
          collection.findOneAndDelete(deleteOptions, (err, data) => {
            if(err) {
              client.close()
              callback({
                error: err
              })
            }
            else {
              client.close()
              callback(data)
            }
          })
        }
        else {
          client.close()
          callback(null)
        }
      }
      catch(error) {
        console.log({
          error: error,
          options: options
        })

        callback({
          error: error.message
        })

        if(client != null) {
          client.close()
        }
      }
    })
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
