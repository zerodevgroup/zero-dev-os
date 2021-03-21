const uuidv1 = require('uuid/v1');

let count = 1;
if(process.argv.length > 2) {
  count = process.argv[2];
}

for(i = 0; i < count; i++) {
  console.log(uuidv1());
}
