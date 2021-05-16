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
      let code = `\
const sockets = require("socket.io");
const redis = require("socket.io-redis");
 
class Radio {
  constructor(options) {
    console.log(options)
    const server = require("http").createServer()

    const io = sockets(server, {
      transports: [ "websocket", "polling" ]
    })

    if(options.useRedis) {
      io.adapter(redis({ host: options.redisServer, port: options.redisPort }));
    }

    this.io = io
    this.port = process.env.PORT || 4000

    server.listen(this.port)

    console.log(\`listening on port \${this.port}\`)
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
