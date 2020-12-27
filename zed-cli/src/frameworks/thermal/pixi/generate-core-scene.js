const fs = require("fs")
const shell = require("shelljs")
const GenerateBase = require("../../../base/generate-base.js")

class GenerateScene extends GenerateBase {
  constructor(project) {
    super(project)

    this.outputFile = `./${this.project.name}/public/thermal/core/scene.js`
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
      let description = this.project.description ? this.project.description : ""

      let code = `\
class Scene {
  constructor(config) {
    this.config = config
  }

  getScene() {
    console.log(\`Creating \${this.config.name}...\`)
    let content = document.createElement("div")
    content.id = this.config.name

    //Create a Pixi Application
    let app = new PIXI.Application()

    // Fit to window and handle resize
    app.renderer.view.style.position = "absolute"
    app.renderer.view.style.display = "block"
    app.renderer.autoDensity = true
    app.renderer.resize(window.innerWidth, window.innerHeight)

    //Add the canvas that Pixi automatically created for you to the HTML document
    content.append(app.view)

    this.app = app

    return content
  }

  render() {
    console.log(\`Rendering \${this.config.name}...\`)

    let imageList = this.config.images.map((image) => {
      return image.path
    })

    PIXI.Loader.shared.add(imageList).load(() => {
      this.config.assets.forEach((asset) => {
        console.log(\`Adding \${asset.name}...\`)

        //Create the sprite
        let sprite = new PIXI.Sprite(PIXI.Loader.shared.resources[asset.image].texture);

        // Center anchor point to rotate around center of sprite
        sprite.anchor.set(0.5, 0.5)

        // Set position if provided
        if(asset.position) {
          sprite.position.set(asset.position.x, asset.position.y)
        }

        // Set scale if provided
        if(asset.scale) {
          sprite.scale.set(asset.scale.x, asset.scale.y)
        }
 
        // Set rotation if provided
        if(asset.rotation) {
          sprite.rotation = Utils.radians(asset.rotation.degrees)
        }
        
        //Add the strite to the stage
        this.app.stage.addChild(sprite)

        asset.sprite = sprite
      })

      // Start the loop
      console.log(\`Starting \${this.config.name} loop...\`)
      this.app.ticker.add(delta => this.loop(delta))
    })

  }
}
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

module.exports = GenerateScene
