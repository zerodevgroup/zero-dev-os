const chalk = require("chalk")
const { execSync } = require("child_process")
const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")


class ZeroDevUtils {
  static message(text) {
    console.log(`${chalk.blue("zero-dev-os:")} ${text}`)
  }

  static warn(text) {
    console.log(`${chalk.blue("zero-dev-os:")} ${chalk.yellow(text)}`)
  }

  static error(text) {
    console.log(`${chalk.blue("zero-dev-os:")} ${chalk.red(text)}`)
  }

  static title(text) {
    console.log(chalk.magenta("========================================================"))
    console.log(chalk.blue(`zero-dev-os: `) + chalk.magenta(text))
    console.log(chalk.magenta("========================================================"))
  }

  static subTitle(text) {
    console.log(chalk.magenta("--------------------------------------------------------"))
    console.log(chalk.blue(`zero-dev-os: `) + chalk.magenta(text))
    console.log(chalk.magenta("--------------------------------------------------------"))
  }

  static indentify(object, indents, indentFirstLine) {
		let objectString = JSON.stringify(object, null, 2)
		let lines = objectString.split(/\n/)

		let newLines = []
		let spaces = ""

		lines.forEach((line, index) => {
			if(index === 0 && !indentFirstLine) {
				spaces = ""
			}   
			else {
				spaces =  " ".repeat(2 * indents)
			}   

			newLines.push(`${spaces}${line}`)
		})  

		let returnString = newLines.join("\n")

		return returnString
  }

  static shell(command) {
    this.message(command)

    let result = shell.exec(command)
  }

  static execSync(command) {
    this.message(command)

    let result = execSync(command)
  }

  static cd(directory) {
    this.warn(`cd ${directory}`)

    let result = shell.cd(directory)
  }

  static getProject(projectFile) {
    if(fs.existsSync(projectFile)) {
      let project = JSON.parse(fs.readFileSync(projectFile, "utf8"))

      return(project)
    }
    else {
      return null
    }
  }

  static chomp(text) {
    let result = text.replace(/[\n\r]+/g, "")

    return result
  }

} 

module.exports = ZeroDevUtils
