const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateGitignore extends GenerateBase {
  constructor(project) {
    super(project);

    this.outputFile = `./${this.project.name}/src/app.js`
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
const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express")

// Read config into env
const config = require("../config.json")
const nodeEnvironment = process.env.NODE_ENV || "dev"
const env = config[nodeEnvironment]
process.env = Object.assign(process.env, env)

const AppRoutes = require("./routes/app-routes")
const Model = require("./components/model")
const ModelRoutes = require("./routes/model-routes")

const app = express()
const port = process.env.port

app.use(bodyParser.json({ limit: "1000mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "1000mb", extended: true }))

app.use(cors())

// Event middleware
app.use("/:action/:modelName", (request, response, next) => {
  let action = request.params.action
  let modelName = request.params.modelName
  let options = request.body

  let authId = request.get("authId")

  console.log({
    "url:": request.originalUrl,
    "action": action,
    "modelName": modelName,
    "options": options,
    "token": process.env.token,
    "authId": authId,
  })

  const statement = \`select * from users where auth_id = '\${authId}'\`

  let modelOptions = {
    data: {
      statement: statement
    },
    modelName: "users",
  }

  let model = new Model(modelOptions)

  model.list((data) => {
    let authorized = (data && data.length > 0) ? true : false

    if(!authorized) {
      response.json({
        status: "error",
        message: "not authorized",
      })
    }
    else if(Object.keys(options).length <= 0) {
      response.json({
        status: "error",
        message: "no options provided",
      })
    }
    else {
      if(action === "create") {
        console.log("Increasing timeout for create request")

        // 300 seconds
        request.setTimeout(300000)
      }

      next()
    }
  })

})


// routes
const router = express.Router()

AppRoutes.getRoutes(router)
ModelRoutes.getRoutes(router)

app.use("/", router)

// start the Express server
app.listen(port, () => {
  console.log(\`server started on port \${port}\`)
})
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

module.exports = GenerateGitignore
