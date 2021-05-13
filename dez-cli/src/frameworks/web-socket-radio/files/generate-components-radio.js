const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateRadio extends GenerateBase {
  constructor(project) {
    super(project)
    this.outputFile = `./${this.project.name}/src/components/radio.js`
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
const sockets = require("socket.io");
const redis = require("socket.io-redis");
 
class Radio {
  constructor(options) {
    const server = require("http").createServer()

    const io = sockets(server, {
      transports: ["websocket", "polling"],
      path: '/radio/socket.io'
    })

    if(options.USE_REDIS) {
      io.adapter(redis({ host: "${redisHost}", port: ${redisPort} }));
    }

    this.io = io

    server.listen(${port})
    console.log(\`listening on port ${port}\`)
  }
}

module.exports = Radio
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

module.exports = GenerateRadio
