const program = require("commander")
const shell = require("shelljs")
const fs = require("fs")
const Generate = require("./components/generate")

program
  .command("generate")
  .option("--output-file [output-file]", "Output File")
  .option("--input-file [input-file]", "Input File")
  .option("--file-path [file-path]", "File path relative to the project root")
  .option("--class-name [class-name]", "GenerateClassName")
  .description("Generate a template")
  .action((options) => {
    let generate = new Generate({
      outputFile: options.outputFile,
      inputFile: options.inputFile,
      filePath: options.filePath,
      className: options.className,
    })

    generate.exec()
  })

program.parse(process.argv)
