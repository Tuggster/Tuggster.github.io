let opOrder = "PEMDAS"; // allows for tweaking of order of operations. Please do adjust!
let inputField = document.getElementById('EqInput');
let outputField = document.getElementById('AnsOutput');

inputField.addEventListener("input", function (e) {
  outputField.innerHTML = "";
  if (validate(inputField.value) == true) {
    outputField.innerHTML += `<p>${inputField.value}</p>`;
    evaluateExpression(inputField.value, true)
  } else {
    outputField.innerHTML = "syntax error";
  }
});

let parenCount = 0;
function evaluateExpression(toEvaluate, print) {
  if (opOrder.indexOf("P") == -1) {
    toEvaluate.replace("(", "");
    toEvaluate.replace(")", "");
  }
  let tokenArray = toEvaluate.split(" ");
  //tokenArray = tokenArray.filter(a => a !== '');
  let done = false;


  while (!done) {
    for (let op = 0; op < opOrder.length; op++) {
      let opSymbol = "(^*/+-".charAt("PEMDAS".indexOf(opOrder.split("")[op]));
      for (let runInOp = 0; runInOp < toEvaluate.split(opSymbol).length - 1; runInOp++) {
        let curChar = 0;
        for (let i = 0; i < tokenArray.length - 1; i++) {
          tokenArray = toEvaluate.split(" ");
          //tokenArray = tokenArray.filter(a => a !== '');
          let token = tokenArray[i];
          if (token == undefined) {
            done = true;
            break;
          }
          let lhs = 0;
          let rhs = 0;

          let operationChar = opOrder.split("")[op];
          if (token.charAt(0) == opSymbol) {
            if (opOrder.split("")[op] != "P") {
              let emptiedArray = tokenArray.filter(a => a !== '');
              lhs = Number(emptiedArray[findFirstCharInArray(opSymbol, emptiedArray) - 1]);
              rhs = Number(emptiedArray[findFirstCharInArray(opSymbol, emptiedArray) + 1]);
            }
            let outcome = -1;
            switch (operationChar) {
              case "P":
                parenCount++;
                let scopeStart = toEvaluate.indexOf("(");
                let scopeEnd = toEvaluate.lastIndexOf(")");
                let microExpression = toEvaluate.substring(scopeStart + 1, scopeEnd);
                let outcomeII = evaluateExpression(microExpression, false);
                toEvaluate = insertIntoEq(toEvaluate, outcomeII, scopeStart, scopeEnd + 1)
                // toEvaluate = insertIntoEq(toEvaluate,  evaluateExpression(toEvaluate.substring(curChar, indexToChar(tokenArray, scopeEnd) + tokenArray[scopeEnd].length)), curChar, indexToChar(tokenArray, scopeEnd) + tokenArray[scopeEnd].length);
                outputField.innerHTML += `<p> ${highlightChanges(toEvaluate, scopeStart, scopeStart + String(outcomeII).length)}</p>`;
                break;
              case "E":
                outcome = 1;
                for (let mulCount = 0; mulCount < rhs; mulCount++) {
                  outcome *= lhs;
                }
                break;
              case "M":
                outcome = lhs * rhs;
                break;
              case "D":
                outcome = lhs / rhs;
                break;
              case "A":
                outcome = lhs + rhs;
                break;
              case "S":
                outcome = lhs - rhs;
                break;
              default:
                outcome = lhs;
                break;

            }

            let opPos = toEvaluate.indexOf(opSymbol);
            let start = opPos - ("" + lhs).length - 1;
            let end = opPos + token.length + ("" + rhs).length + ("" + lhs).length;
            if (operationChar != "P") {
              console.log(toEvaluate);
              console.log(`LHS: ${lhs}, RHS: ${rhs}, OPERATOR: ${operationChar}`);
              console.log(`RESULT: ${outcome}`);
              console.log(`Character index of operator: ${opPos}, pos of lhs start: ${start}, pos of rhs end: ${end}`);
              console.log(`length of lhs: ${String(lhs).length}, length of rhs: ${String(rhs).length}`);
              console.log(`lhs: ${String(lhs)}, rhs: ${String(rhs)}`);
              toEvaluate = insertIntoEq(toEvaluate, outcome, start, end);
              console.log(`operated string: ${toEvaluate}`);
              if (print) {
                let out = `<p>${highlightChanges(toEvaluate, start, start + String(outcome).length)}</p>`;
                outputField.innerHTML += out;
              }
            }

          }
          curChar += token.length;
          //done = true;

          if (tokenArray.length <= 1 || toEvaluate.indexOf(" ") == -1) {
            done = true;
            break;
          }
        }
      }
    }
  }

  return toEvaluate;
}

function findFirstCharInArray(target, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].indexOf(target) != -1) {
      return i;
    }
  }
  return -1;
}

function highlightChanges(text, start, end) {
  return text.substring(0, start) + "<b style=\"color:blue\">" + text.substring(start, end) + "</b>" + text.substring(end);
}

function insertIntoEq(old, value, start, end) {
  //toEvaluate.substring(0, curChar) + evaluateExpression(toEvaluate.substring(curChar, indexToChar(tokenArray, scopeEnd) + tokenArray[scopeEnd].length)) + toEvaluate.substring(indexToChar(tokenArray, scopeEnd) + tokenArray[scopeEnd].length)
  return old.substring(0, start) + value + old.substring(end);
}

function indexToChar(split, index) {
  let sum = 0;
  for (let i = 0; i < index; i++) {
    sum += split[i].length + 1;
  }
  return sum;
}

function findCloseParen(baseEq, parenCount) {
  let tokenArray = baseEq.split(" ");
  for (let i = tokenArray.length - 1; i > 0; i--) {
    if (tokenArray[i].charAt(tokenArray[i].length-1) == ")") {
      return i;
    }
  }
  return -1;
}

function validate(toValidate) {
  let tokenArray = toValidate.split(" ");
  tokenArray = tokenArray.filter(a => a !== '')

  while (toValidate.charAt(toValidate.length - 1) == " ") {
    toValidate = toValidate.substring(0, toValidate.length - 1);
  }

  if (tokenArray.length % 2 == 0)
    return false;

  for (let i = 0; i < tokenArray.length; i++) {
    if (i % 2 == 0) {
      if (!tokenArray[i].match("^[0-9()]*$")) {
        return false;
      }
    } else {
      if (!tokenArray[i].match("[-+*^/]")) {
        return false;
      }
    }
  }

  if (toValidate.split("(").length - 1 != toValidate.split(")").length - 1)
    return false;


  if (tokenArray.length <= 1)
    return false;

  for (let i = 0; i < tokenArray.length; i++) {
    if (tokenArray[i].match("[-+/*^]") && tokenArray[i].match("[0-9]"))
      return false;
  }

  return true;
}
