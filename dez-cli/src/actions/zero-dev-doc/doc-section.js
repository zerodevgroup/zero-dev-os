const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")

class DocSection {
  constructor(options) {
    this.options = options
  }

  generateContent() {
    // Generated code starts here
    // Make sure to put a "" before any ` or $
    let content = `
    <div class="pagebreak"></div>

    <a id="${this.options.name}">
      <div class="sub-heading">${this.options.title}</div>
    </a>
`
    if(this.options.items) {
      this.options.items.forEach((item) => {
        // item status (Draft/Approved)
        let status = ""
        if("status" in item) {
          if(item.status === "Draft") {
            status = " draft"
          }
          else if(item.status === "Approved") {
            status = " approved"
          }
        }

        // Paragraph type
        if(item.type === "Paragraph") {
          if("title" in item) {
            content += `
    <div class="paragraph-heading${status}" style="margin-top: 20px">${item.title}</div>
`
          }
          if("text" in item) {
            content += `
    <div class="text${status}" style="margin-top: 10px">${item.text}</div>
`
          }
        }
        // Link type
        else if(item.type === "Link") {
          content += `
    <div style="margin-top: 10px">
`
          content += `
      <a class="text${status}" href="${item.link}" style="margin-top: 10px">${item.text}</a>
`
          content += `
    </div>
`
        }
        // Image type
        else if(item.type === "Image") {
          let base64Image = this.generateBase64(item.image)
          if(! "width" in item) {
            item.width = "100%"
          }
          if(! "height" in item) {
            item.height = "100%"
          }

          content += `
    <div style="display: inline-block; margin-top: 20px; text-align: center; width: 100%;">
`
          content += `
      <img style="width: ${item.width}; height=${item.height};" src="data:image/png;base64, ${base64Image}"/>
`
          content += `
    </div>
`
        }
        // Code type
        else if(item.type === "Code") {
          let gistContent = this.getGistContent(item.url)
          content += `
    <div class="code${status}">
      <pre>
`
          content += gistContent

          content += `\
      </pre>
    </div>
`
        }
        // List type
        else if(item.type === "List") {
          content += `
    <div class="text${status}">
`

          content += `
      <ul>
`
          item.listItems.forEach((listItem) => {
            content += `
        <li>${listItem.text}</li>
`
          })
          content += `
      </ul>
`

          content += `
    </div>
`
        }
        // Table type
        else if(item.type === "Table") {
          content += `
    <table class="table text-small${status}">
`
          content += `
      <colgroup>
`
          let columnCount = item.tableHeaderItems.length
          item.tableHeaderItems.forEach((tableHeaderItem) => {
            let width = tableHeaderItem.width ? tableHeaderItem.width : `${parseInt((1 / columnCount) * 100)}%`

            content += `
        <col style="width: ${width};">
`
          })

          content += `
      </colgroup>
`

          content += `
      <tr>
`
          item.tableHeaderItems.forEach((tableHeaderItem) => {
            let align = tableHeaderItem.align ? tableHeaderItem.align : "left"

            content += `
        <th style="text-align: ${align}">${tableHeaderItem.text}</th>
`
          })

          content += `
      </tr>
`
          let calculatedFieldMap = {}
          let sum = {}
          if("calculatedFields" in item) {
            calculatedFieldMap = _.keyBy(item.calculatedFields, "name")
          }

          item.tableRows.forEach((tableRow) => {
            content += `
      <tr>
`
            tableRow.tableItems.forEach((tableItem, index) => {
              let align = tableItem.align ? tableItem.align : "left"

              content += `
        <td style="text-align: ${align};">${tableItem.text}</td>
`
              let tableHeaderItem = item.tableHeaderItems[index]
              if(calculatedFieldMap[tableHeaderItem.text]) {
                if(tableHeaderItem.text in sum) {
                  sum[tableHeaderItem.text] += parseInt(tableItem.text)
                }
                else {
                  sum[tableHeaderItem.text] = parseInt(tableItem.text)
                }
              }
            })

          content += `
      </tr>
`
          })

          // Check to see if there are calculated fields
          if("calculatedFields" in item) {
            content += `
      <tr>
`
            
            item.tableHeaderItems.forEach((tableHeaderItem) => {
              let align = tableHeaderItem.align ? tableHeaderItem.align : "left"

              if(calculatedFieldMap[tableHeaderItem.text]) {
                content += `
        <th style="text-align: ${align}">${sum[tableHeaderItem.text]}</th>
`
              }
              else {
                content += `
        <th style="text-align: ${align}">&nbsp;</th>
`
              }
            })

            content += `
      </tr>
`
          }

          content += `
    </table>
`
        }
      })
    }


    return(content)
  }

  generateBase64(image) {
    let base64Image = shell.exec(`base64 ${image}`, {silent: true}).stdout
    return(base64Image)
  }

  getGistContent(gistUrl) {
    let gistContent = shell.exec(`curl ${gistUrl}`, {silent: true}).stdout
    return(gistContent)
  }
}

module.exports = DocSection
