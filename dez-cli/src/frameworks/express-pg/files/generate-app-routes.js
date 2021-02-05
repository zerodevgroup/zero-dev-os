const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateAppRoutes extends GenerateBase {
  constructor(project) {
    super(project)
    this.outputFile = `./${this.project.name}/src/routes/app-routes.js`
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
class AppRoutes {
  static getRoutes(router) {
    /**
     * @api {get} /status/ Get Status
     * @apiName status
     * @apiGroup app
     * @apiVersion 0.1.0
     *
     * @apiSuccessExample Success-Response:
     *   HTTP/1.1 200 OK
     *   {
     *     "status": "OK"
     *   }
     *
     */
    router.get("/status", (request, response) => {
      response.json({
        status: "OK"
      })
    })
  }
}

module.exports = AppRoutes\
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
