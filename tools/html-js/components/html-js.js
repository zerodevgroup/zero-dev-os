const fs = require("fs")
const nhp = require("node-html-parser")
const shell = require("shelljs")

class HtmlJs {
  constructor(options) {
    this.options = options
  }

  exec() {
    //console.log(this.options)

    let html = fs.readFileSync(this.options.htmlFile).toString()
    //console.log(html)
    
    const root = nhp.parse(html)
    // console.log(root.childNodes[0])
    // console.log(root.childNodes[0].rawTagName)

    // Root Node
    let rootNode = root.childNodes[0]
    this.renderNode(rootNode)

  }

  renderNode(node, parentNode) {
    // console.log(node)

    let spaces = this.options.spaces ? this.options.spaces : 4

    let rawAttributeString = node.rawAttrs.replace(/" /g, '"&').replace(/"/g, '')

    let rawAttributes = JSON.parse('{"' + rawAttributeString.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) })

    let elementName = ""
    let attributes = []
    let classes = []

    Object.keys(rawAttributes).forEach((key) => {
      if(key === "name" || key === "id") {
        elementName = rawAttributes[key]
      }
      else if(key === "class") {
        classes = rawAttributes.class.split(/\s+/)
      }
      else {
        attributes.push({
          name: key,
          value: rawAttributes[key]
        })
      }
    })

    console.log(`
${" ".repeat(spaces)}// ${elementName}
${" ".repeat(spaces)}let ${elementName} = document.createElement("${node.rawTagName}")
${" ".repeat(spaces)}${elementName}.id = "${elementName}"
${" ".repeat(spaces)}${elementName}.name = "${elementName}"\
`)
    classes.forEach((className) => {
      console.log(`\
${" ".repeat(spaces)}${elementName}.classList.add("${className}")\
`)
  
    })
    attributes.forEach((attribute) => {
      console.log(`\
${" ".repeat(spaces)}${elementName}.setAttribute("${attribute.name}", "${attribute.value}")\
`)
  
    })

    node.childNodes.forEach((childNode) => {
      if(childNode.rawAttrs) {
        this.renderNode(childNode, elementName)
      }
      else if(childNode.rawText.trim()) {
        this.renderText(childNode, elementName)
      }
    })

    if(parentNode) {
      console.log(`
${" ".repeat(spaces)}${parentNode}.append(${elementName})\
`)
    }
    else {
      console.log(`
${" ".repeat(spaces)}return ${elementName}\
`)
    }

  }

  renderText(node, parentNode) {
    let spaces = this.options.spaces ? this.options.spaces : 4
    console.log(`
${" ".repeat(spaces)}${parentNode}.append("${node.rawText.trim()}")\
`)
  }

}

module.exports = HtmlJs
