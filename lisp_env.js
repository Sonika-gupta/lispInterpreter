module.exports = {
  print: (data) => console.log(Array.isArray(data) ? (data = `(${data.join(' ')})`) : data),
  operations: {
    begin: (...args) => args[args.length - 1],
    list: (...list) => [...list],
    append: (list, ...args) => list.push(...args),
    length: list => list.length,
    car: list => list.length ? list[0] : null,
    cdr: list => list.length - 1 ? list.slice(1) : null,
    map: (func, list) => list.map(el => func(el)),
    cons: (num, list) => (typeof list === 'string') ? `${num}`.concat(' ', list) : [num].concat(list),
    quote: (input) => input && input.length ? `${input}` : '',

    '+': (...args) => args.reduce((sum, el) => (sum += el)),
    '-': (...args) => args.reduce((sum, el) => (sum -= el)),
    '*': (...args) => args.reduce((sum, el) => (sum *= el)),
    '/': (...args) => args.reduce((sum, el) => (sum /= el)),
    sqrt: num => Math.sqrt(num),
    expt: (base, exponent) => Math.pow(base, exponent),
    pow: (base, exponent) => Math.pow(base, exponent),
    min: (...args) => Math.min(...args),
    max: (...args) => Math.max(...args),
    abs: num => Math.abs(num),
    round: num => Math.round(num),
    mod: (num, div) => {
      const rem = num % div
      return (div ^ rem) < 0 ? div + rem : rem
    },
    rem: (num, div) => num % div,
    sin: num => Math.sin(num),
    cos: num => Math.cos(num),
    tan: num => Math.tan(num),

    and: (...args) => args.reduce((res, val) => (res = res && val)),
    or: (...args) => args.reduce((res, val) => (res = res || val)),
    not: num => !num,

    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
    '=': (a, b) => a === b
  },

  'null?': value => value === null,
  'number?': value => typeof value === 'number',
  'symbol?': value => typeof value === 'string',
  'procedure?': value => typeof value === 'function',
  'list?': value => Array.isArray(value),

  pi: Math.PI,
  true: true,
  false: false
}

// module.exports = lisp_env;
