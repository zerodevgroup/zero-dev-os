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

  static shell(command) {
    this.message(command)

    let result = shell.exec(command)
    return result
  }

  static execSync(command) {
    this.message(command)

    let result = execSync(command)
    return result
  }

  static cd(directory) {
    this.warn(`cd ${directory}`)

    let result = shell.cd(directory)
  }

  static chomp(text) {
    let result = text.replace(/[\n\r]+/g, "")

    return result
  }
} 

module.exports = ZeroDevUtils
