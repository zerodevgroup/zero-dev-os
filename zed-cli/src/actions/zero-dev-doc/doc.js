const fs = require("fs")
const shell = require("shelljs")

const DocHeader = require("./doc-header")
const DocSection = require("./doc-section")

class Doc {
  constructor(options) {
    this.options = options
    this.config = options.config
    this.items = []

    this.items.push(`\
<!DOCTYPE html>
<html>
  <head>
    <title>${this.options.title}</title>
    <link href="${this.config.style.font.url}" rel="stylesheet">
    <style>
      @page {
        size: ${this.config.page.size};
        margin: ${this.config.page.margin};
      }

      @media print {
        .pagebreak {
          page-break-before: always;
        }
      }

      .heading {
        color: ${this.config.style.heading.color};
        font-size: ${this.config.style.heading.fontSize};
        font-weight: ${this.config.style.heading.fontWeight};
      }

      .sub-heading {
        color: ${this.config.style.subHeading.color};
        font-size: ${this.config.style.subHeading.fontSize};
        font-weight: ${this.config.style.subHeading.fontWeight};
      }

      .sub-heading-alt {
        color: ${this.config.style.subHeadingAlt.color};
        font-size: ${this.config.style.subHeadingAlt.fontSize};
        font-weight: ${this.config.style.subHeadingAlt.fontWeight};
      }

      .paragraph-heading {
        color: ${this.config.style.paragraphHeading.color};
        font-size: ${this.config.style.paragraphHeading.fontSize};
        font-weight: ${this.config.style.paragraphHeading.fontWeight};
      }

      .text {
        color: ${this.config.style.text.color};
        font-size: ${this.config.style.text.fontSize};
      }

      .text-small {
        color: ${this.config.style.textSmall.color};
        font-size: ${this.config.style.textSmall.fontSize};
      }

      .code {
        font-family: "Lucida Console", Monaco, monospace;
        margin-left: ${this.config.style.code.marginLeft};
        color: ${this.config.style.code.color};
        font-size: ${this.config.style.code.fontSize};
        background-color: ${this.config.style.code.backgroundColor};
      }

      .text-right {
        text-align: right;
      }

      .text-left {
        text-align: left;
      }

      .text-center {
        text-align: center;
      }

      .logo {
        vertical-align: top;
        display: inline-block;
        text-align: center;
        width: 125px;
      }

      .logo-image {
        width: ${this.config.style.logo.width};
        height: ${this.config.style.logo.height};
      }

      .logo-caption {
        display: block;
        color: ${this.config.style.logo.caption.color};
        font-size: ${this.config.style.logo.caption.fontSize};
        font-weight: ${this.config.style.logo.caption.fontWeight};
      }

      .table {
        border-collapse: collapse;
        width: 100%;
      }

      .table td, .table th {
        border: 1px solid #ddd;
        padding: 8px;
      }

      .table tr:nth-child(even){background-color: ${this.config.style.table.row.alternateColor};}

      .table tr:hover {background-color: ${this.config.style.table.row.hoverColor};}

      .table th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: ${this.config.style.table.header.backgroundColor};
        color: ${this.config.style.table.header.color};
      }

      .draft {
        color: ${this.config.style.status.draft.color};
      }

      .submitted {
        color: ${this.config.style.status.submitted ? this.config.style.status.submitted.color : this.config.style.status.draft.color};
      }

      .approved {
        color: ${this.config.style.status.approved.color};
      }
    </style>
  </head>
  <body style="font-family: ${this.config.style.font.name};">\
`)

    if("background" in this.options) {
      let backgroundBase64Image = this.generateBase64(this.options.background.image)

      this.items.push(`\
    <div style="position: absolute; top: ${this.options.background.yOffset}; right: ${this.options.background.xOffset};">
      <img src="data:image/png;base64, ${backgroundBase64Image}"/>
    </div>\
`)
    }

  }

  append(item) {
    let component = eval(`new ${item.component}(item)`)
    this.items.push(component.generateContent())
  }

  save() {
    this.items.push(`\
  </body>
</html>\
`)
    fs.writeFileSync(`${this.options.output}/${this.options.name}.html`, this.items.join("\n")) 
  }

  generateBase64(image) {
    let base64Image = shell.exec(`base64 ${image}`, {silent: true}).stdout
    return(base64Image)
  }
}

module.exports = Doc
