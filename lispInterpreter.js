const global = require('./lisp_env')
const specialForms = {}
specialForms.if = (scope, args) => {
  let value
  if (args.length !== 3) {
    throw new SyntaxError('Invalid args to if')
  } else if (interpret(scope, args[0])[0]) { return ((value = interpret(scope, args[1]))) ? value[0] : evaluate(scope, args[1]) } else return ((value = interpret(scope, args[2]))) ? value[0] : evaluate(scope, args[2])
}
specialForms.while = (scope, args) => {
  if (args.length !== 2) {
    throw new SyntaxError('Invalid args to while')
  }
  while (evaluate(scope, args[0])) {
    evaluate(scope, args[1])
  }
  return null
}
specialForms.do = (scope, args) => {
  let value
  for (const arg of args) {
    value = evaluate(scope, arg)
  }
  return value
}
specialForms.define = (scope, [key, value]) => {
  if (value === undefined || Number(key)) throw new SyntaxError('Incorrect use of define')
  scope[key] = value
}
specialForms.set = (scope, [key, value]) => {
  if (value === undefined || Number(key)) throw new SyntaxError('Incorrect use of set')
  if (!(key in scope)) throw new ReferenceError(`Undefined variable ${key}`)
  scope[key] = value
}
specialForms.lambda = (scope, [params, body]) => {
  if (!params || !body) {
    throw new SyntaxError('Function Body Required')
  }
  params = params.map(value => {
    if (Number(value)) {
      throw new SyntaxError('Parameter names must be variables')
    }
    return value
  })

  return function () {
    if (arguments.length !== params.length) {
      throw new TypeError('Invalid arguments')
    }
    const localScope = Object.create(scope)
    for (let i = 0; i < arguments.length; i++) {
      localScope[params[i]] = arguments[i]
    }
    return interpret(localScope, body)[0]
  }
}

specialForms.count = (scope, [value, list]) => {
  value = interpret(scope, value)
  value = value ? value[0] : evaluate(scope, value)
  list = interpret(scope, list)[0]
  return (typeof list === 'string')
    ? (list.match(new RegExp(`${value}`, 'g')) || []).length
    : list.filter(el => el === value).length
}

function evaluate (scope, action, args) {
  // console.log('action:', action, 'args:', args);
  if (!args || !args.length) {
    if (action === null) return []
    if (!isNaN(Number(action)) && !isNaN(parseFloat(action))) return Number(action)
    if (action in scope) return scope[action]
    return action
  }

  if (typeof action === 'function') return action(...args)

  if (action in specialForms) return specialForms[action](scope, args)

  if (action in scope) return scope[action](...args)

  if (action in global.operations) { return global.operations[action](...args.map(el => evaluate(scope, el))) }

  if (!isNaN(parseFloat(action))) return [Number(action), ...args.map(el => evaluate(el))]

  throw new SyntaxError(`Unknown Keyword ${action}`)
}

const spaceParse = input => input && input.replace(/^\s*|\s*$/, '')

function getWord (input) {
  input = spaceParse(input)
  const word = input.match(/^[^\s)()]+/)
  return word ? [word[0], spaceParse(input.slice(word[0].length))] : [null, spaceParse(input)]
}
function getExpr (input) {
  input = spaceParse(input)
  if (input[0] !== '(') return null
  let brackets = 1; let i = 1
  while (brackets && i < input.length) {
    if (input[i] === '(') brackets++
    else if (input[i] === ')') brackets--
    i++
  }
  if (brackets) return null
  return [input.slice(0, i), input.slice(i)]
}

function extractDefine (scope, input) {
  let name, value;
  [name, input] = getWord(input);
  [value, input] = interpret(scope, input) || getWord(input)
  return [[name, value], input]
}

function extractLambda (input) {
  const parameters = []; let body
  input = spaceParse(input.slice(1))
  while (input[0] !== ')') {
    let value;
    [value, input] = getWord(input)
    parameters.push(value)
  }

  [body, input] = getExpr(input.slice(1))
  return [[parameters, body], input]
}

function extractCount (input) {
  let value, list;
  [value, input] = getExpr(input) || getWord(input);
  [list, input] = getExpr(input)
  return [[value, list], input]
}

function extractConditional (input) {
  const args = []
  for (let i = 0; i < 3; i++) {
    [args[i], input] = getExpr(input) || getWord(input)
  }
  return [args, input]
}

function extractSpecialForm (scope, action, input) {
  switch (action) {
    case 'map':
    case 'set':
    case 'define': return extractDefine(scope, input)
      // case 'let': return extractLet(scope, input);
    case 'lambda': return extractLambda(input)
    case 'count': return extractCount(input)
    default: return extractConditional(input)
  }
}

function interpret (scope, input) {
  if (input[0] !== '(') return null
  input = spaceParse(input.slice(1))
  let action; let args = []; let value;
  [action, input] = interpret(scope, input) || getWord(input)

  if (action in specialForms) {
    [args, input] = extractSpecialForm(scope, action, input)
  } else if (action === 'quote') {
    [value, input] = getExpr(input) || getWord(input)
    args.push(value.slice(1, -1))
  } else {
    while (input && input[0] !== ')') {
      let value;
      [value, input] = interpret(scope, input) || getWord(input)
      // [value, input] = getExpr(input) || getWord(input);
      if (value === null) throw Error(`What? ${input}`)
      args.push(evaluate(scope, value))
    }
  }
  if (input) input = input.slice(1)
  return [evaluate(scope, action, args), spaceParse(input)]
}

function run (scope, data) {
  data = data.split('\n').filter(line => line[0] !== '#').join(' ')
  while (data) {
    let value;
    [value, data] = interpret(scope, spaceParse(data))
    if (value) console.log(value)
  }
}

const fs = require('fs')
// Run Test files in a Directory:
fs.readdir('./lispInterpreter/lisptest', (err, files) => {
  if (err) { console.log(err) } else {
    files.forEach(file => {
      console.log(`\n${file}`)
      const data = fs.readFileSync(`./lispInterpreter/lisptest/${file}`)
      run(global, data.toString())
    })
  }
})

// Run Single file:
/* const data = fs.readFileSync(`./lispInterpreter/lisptest/test7.lisp`);
run(global, data.toString()); */
