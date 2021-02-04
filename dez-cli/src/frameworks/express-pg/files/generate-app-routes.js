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
let Model = require("../components/model")

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

    router.post("/charge", (request, response) => {
      // Set your secret key: remember to change this to your live secret key in production
      // See your keys here: https://dashboard.stripe.com/account/apikeys
      const stripe = require("stripe")(process.env.stripeSecret)

      // Token is created using Stripe Checkout or Elements!
      // Get the payment token ID submitted by the form:
      const token = request.body.stripeToken
      const description = request.body.description
      const amount = parseInt(request.body.amount)
      const redirect = request.body.redirect
      const errorRedirect = request.body.errorRedirect

      let runCharge = async () => {
        try {
          const charge = await stripe.charges.create({
            amount: amount,
            currency: "usd",
            description: description,
            source: token,
          })

          response.redirect(redirect)
        }
        catch(error) {
          response.redirect(errorRedirect)
        }

      }

      runCharge()

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
