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
const axios = require("axios")
const fs = require("fs")

// Read config into env
const config = require("../config.json")
const nodeEnvironment = process.env.NODE_ENV || "dev"
const env = config[nodeEnvironment]

const shell = require("shelljs")

process.env = Object.assign(process.env, env)

let loopCount = 0
let members = []
let rules = []

const oodaLoop = async () => {
  if(loopCount % 10 === 0) {
    // Read business rules
    console.log("Reading business rules...")

    let rulesResponse = await axios({
      method: "post",
      url: "http://business-rules-service/list/rules",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "authId": process.env.TOKEN,
      },
      data: {
        statement: "select * from rules"
      }
    })

    rules = rulesResponse.data
    console.log(rules)

    loopCount = 0
  }

  for(let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    let rule = rules[ruleIndex]
    console.log(\`Executing rule: \${rule.name}\`)

    // Query data for matching data
    console.log("Finding matching members")

    if(rule.condition === "Not Registered - MyBlue Account") {
      let membersResponse = await axios({
        method: "post",
        url: "http://member-service/list/members",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "authId": process.env.TOKEN,
        },
        data: {
          statement: "select * from members where enrolled_in_plan = true and COALESCE(web_registration_flag, FALSE) = FALSE and COALESCE(web_registration_notification, FALSE) = FALSE"
        }
      })

      let matchingMembers = membersResponse.data
      console.log(\`Found \${matchingMembers.length} for rule \${rule.name}\`)

      for(let memberIndex = 0; memberIndex < matchingMembers.length; memberIndex++) {
        let member = matchingMembers[memberIndex]
        console.log(\`Sending \${rule.name} notification to \${member.email}\`)

        member.webRegistrationNotification = true

        let memberUpdateResponse = await axios({
          method: "post",
          url: "http://member-service/update/members",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "authId": process.env.TOKEN,
          },
          data: member
        })
      }

      if(matchingMembers && matchingMembers.length > 0) {
        let sendEmailResponse = await axios({
          method: "post",
          url: "http://channel-service/send-email",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "authId": process.env.TOKEN,
          },
          data: {}
        })
      }
    }

    // Take action
  }

  loopCount++
  setTimeout(oodaLoop, process.env.WAIT_MILLISECONDS)
}

console.log(\`Running oodaLoop with wait of \${process.env.WAIT_MILLISECONDS}ms\`)
oodaLoop()
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
