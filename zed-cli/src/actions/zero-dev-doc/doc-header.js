const fs = require("fs")
const moment = require("moment")
const shell = require("shelljs")

class DocHeader {
  constructor(options) {
    this.options = options

    let now = moment()
    this.date = now.format("YYYY-MM-DD")
    this.version = now.format("YYYYMMDD.HHmm")
    this.month = now.format("MMMM")
    this.year = now.format("YYYY")
  }

  generateContent() {
    let base64Logo = this.generateBase64(this.options.logo)

    let date = this.options.date ? this.options.date : this.date
    let month = this.options.month ? this.options.month : this.month
    let year = this.options.year ? this.options.year : this.year
    let version = this.options.version ? this.options.version : this.version

    let content = `
    <table style="width: 100%">
      <tr>
        <td>
          <div class="logo">
            <img class="logo-image" src="data:image/png;base64, ${base64Logo}"/>
            <span class="logo-caption">${this.options.brandName}</span>
          </div>
        </td>
        <td style="float: right;">
          <span class="sub-heading-alt">${month}</span>
          <span>&nbsp;</span>
          <span class="heading">${year}</span>
        </td>
      </tr>
      <tr>
        <td>
          <div class="heading">${this.options.title}</div>
        </td>
      </tr>
    </table>
    <div style="margin-top: 20px;"></div>
    <table>
      <tr>
        <th>
          <div class="text text-right">Author:</div>
        </th>
        <td>
          <div class="text">${this.options.author}</div>
        </td>
      </tr>
      <tr>
        <th>
          <div class="text text-right">Date:</div>
        </th>
        <td>
          <div class="text">${date}</div>
        </td>
      </tr>
      <tr>
        <th>
          <div class="text text-right">Version:</div>
        </th>
        <td>
          <div class="text">${version}</div>
        </td>
      </tr>
    </table>
`

    return(content)
  }

  generateBase64(image) {
    let base64Image = shell.exec(`base64 ${image}`, {silent: true}).stdout
    return(base64Image)
  }
}

module.exports = DocHeader
