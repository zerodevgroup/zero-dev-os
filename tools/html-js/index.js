const program = require("commander")
const shell = require("shelljs")
const fs = require("fs")
const HtmlJs = require("./components/html-js")

program
  .option("--html-file <html file>", "HTML File")
  .option("--spaces <spaces>", "Spaces")
  .description("Convert HTML to JavaScript")
  .action((options) => {
    let htmlJs = new HtmlJs({
      htmlFile: options.htmlFile,
      spaces: options.spaces,
    })

    htmlJs.exec()
  })

program.parse(process.argv)

