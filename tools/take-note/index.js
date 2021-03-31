const fs = require("fs")
const moment = require("moment")
const shell = require("shelljs")

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question("Topic: ", (topic) => {
  readline.close()

  shell.exec(`mkdir -p ~/notes/${topic}`)
  shell.cd(`~/notes/${topic}`)

  const now = moment()
  const timestamp = now.valueOf().toString()
  const dateString = moment().format("YYYY-MM-DD HH:mm:ss");

  const content = `# ${topic} ${dateString}`
  fs.writeFileSync(`note-${topic}-${timestamp}.txt`, content)

  console.log(`cd ~/notes/${topic}`)
  console.log(`vi note-${topic}-${timestamp}.txt`)
})
