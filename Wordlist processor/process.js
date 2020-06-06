var fs = require('fs');
let toGet = 30;
var letters = /^[A-Za-z]+$/;

var logger = fs.createWriteStream('wordsConcat.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

fs.writeFile('wordsConcat.txt', '', function(){console.log('done clearing')})
fs.readFile('words.txt', function(err, data) {
    if(err) throw err;
    var array = data.toString().split("\n");
    for(let i = 0; i < toGet; i++) {
        let pos = getRandomInt(array.length);
        if (!meetsConditions(array[pos])) {
          i--;
          continue;
        }
        logger.write(`${array[pos]},\n`) // write
    }
    console.log("done.");
    logger.end() // close string
});

function meetsConditions(word) {
  if (word.slice(-1) == "s") {
    return false;
  }

  if (getRandomInt(20) == 5)
    return true;

  if (word.length <= 3) {
    return false;
  }

  if (word.length >= 8) {
    return false;
  }

  if (!(word.slice(-3) == "ing" || word.slice(-2) == "ed")) {
    return false;
  }

  if (!word.match(letters)) {
    return false;
  }

  return true;
}
