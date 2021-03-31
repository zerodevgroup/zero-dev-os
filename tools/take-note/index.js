const { v4: uuidv4 } = require('uuid')

let count = 1;
if(process.argv.length > 2) {
  count = process.argv[2]
}

for(i = 0; i < count; i++) {
  console.log(uuidv4())
}
