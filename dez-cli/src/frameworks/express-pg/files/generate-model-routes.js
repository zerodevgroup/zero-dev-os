const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateAppRoutes extends GenerateBase {
  constructor(project) {
    super(project)
    this.outputFile = `./${this.project.name}/src/routes/model-routes.js`
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
let assert = require("assert")
let Model = require("../components/model")

class ModelRoutes {
  static getRoutes(router) {
    //  list
    router.post("/list/:modelName", (request, response) => {
      let modelName = request.params.modelName
      let data = request.body

      let options = {}
      options.modelName = modelName
      options.data = data

      let model = new Model(options)

      model.list((data) => {
        response.json(data)
      })
    })

    //  find
    router.post("/find/:modelName", (request, response) => {
      let modelName = request.params.modelName
      let data = request.body

      let options = {}
      options.modelName = modelName
      options.data = data

      let model = new Model(options)

      model.find((data) => {
        response.json(data)
      })
    })

    //  create
    router.post("/create/:modelName", (request, response) => {
      let modelName = request.params.modelName
      let data = request.body

      let options = {}
      options.modelName = modelName
      options.data = data

      let model = new Model(options)

      model.create((resultData) => {
        response.json(resultData)
      })

    })

    //  update
    router.post("/update/:modelName", (request, response) => {
      let modelName = request.params.modelName
      let data = request.body

      let options = {}
      options.modelName = modelName
      options.data = data

      let model = new Model(options)

      model.update((resultData) => {
        response.json(resultData)
      })
    })

    //  delete
    router.post("/delete/:modelName", (request, response) => {
      let modelName = request.params.modelName
      let data = request.body

      let options = {}
      options.modelName = modelName
      options.data = data

      let model = new Model(options)

      model.delete((resultData) => {
        response.json(resultData)
      })
    })
  }

}

module.exports = ModelRoutes\
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

module.exports = GenerateAppRoutes
