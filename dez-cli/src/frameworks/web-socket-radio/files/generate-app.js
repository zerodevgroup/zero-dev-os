const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateApp extends GenerateBase {
  constructor(project) {
    super(project)
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

      let port = this.project.config.port ? this.project.config.port : 4000
      let redisHost = this.project.config.redis.host ? this.project.config.redis.host : "localhost"
      let redisPort = this.project.config.redis.port ? this.project.config.redis.port : 6379

      let code = `\
const Radio = require("./components/radio.js")

let radio = new Radio({
  USE_REDIS: false
})

radio.io.on("connection", (socket) => {
  console.log(\`\${socket.id} connected\`)

  socket.on("message", (dataJSON) => {
    let data = JSON.parse(dataJSON)
    console.log(\`\${socket.id} \${data}\`)
  })
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

module.exports = GenerateApp
