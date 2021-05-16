const fs = require('fs')
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateApp extends GenerateBase {
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
const Radio = require("./components/radio.js")

let radio = new Radio({
  useRedis: process.env.USE_REDIS ? process.env.USE_REDIS : false,
  redisServer: process.env.REDIS_SERVER ? process.env.REDIS_SERVER : "localhost",
  redisPort: process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379,
})

radio.io.on("connection", (socket) => {
  console.log(\`\${socket.id} connected\`);

  (async () => {
    const sockets = await radio.io.fetchSockets()
    console.log("Clients:")
    console.log("-----------------")
    sockets.forEach((socket) => {
      console.log(socket.id)
    })
    console.log("-----------------")
  })().catch(err => {
    console.error(err);
  })

  socket.emit("system", JSON.stringify({"system": 
    {
      "message": \`Welcome \${socket.id}\`,
      "port": radio.port,
    }
  }))

  socket.on("message", (dataJSON) => {
    let data = JSON.parse(dataJSON)
    console.log(\`\${socket.id}\\n\${JSON.stringify(data, null, 2)}\`)
    socket.broadcast.emit("message", dataJSON)
  })

  socket.on("disconnect", () => {
    console.log(\`\${socket.id} disconnected\`);

    (async () => {
      const sockets = await radio.io.fetchSockets()
      console.log("Clients:")
      console.log("-----------------")
      sockets.forEach((socket) => {
        console.log(socket.id)
      })
      console.log("-----------------")
    })().catch(err => {
      console.error(err);
    })
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
