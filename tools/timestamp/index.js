const moment = require("moment")

if(process.argv[2]) {
  let arg = process.argv[2]
  let date

  if(arg.match(/\//)) {
    date = moment(new Date(arg))
    console.log(date.valueOf())
  }
  else if(arg.match(/-/)) {
    date = moment(new Date(arg))
    console.log(date.valueOf())
  }
  else {
    date = moment(parseInt(arg))
    console.log(date.format("YYYY-MM-DD HH:mm:ss"))
  }
}
else {
  console.log(moment().valueOf().toString())
}
