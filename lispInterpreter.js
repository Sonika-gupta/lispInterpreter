const global = require("./lisp_env");
const specialForms = {};
specialForms.if = (scope, args) => {
	if (args.length != 3) {
		throw new SyntaxError("Invalid args to if");
	} else if (interpret(scope, args[0])[0]) {
		return interpret(scope, args[1])[0];
	} else {
		return interpret(scope, args[2])[0];
	}
};

specialForms.while = (scope, args) => {
	if (args.length != 2) {
		throw new SyntaxError("Invalid args to while");
	}
	while (evaluate(scope, args[0])) {
		evaluate(scope, args[1]);
	}
	return null;
};

specialForms.do = (scope, args) => {
	let value;
	for (let arg of args) {
		value = evaluate(scope, arg);
	}
	return value;
};

specialForms.define = (scope, [key, value]) => {
	if (value == undefined || Number(key)) {
		throw new SyntaxError("Incorrect use of define");
	}
	scope[key] = value;
	// return value;
};

specialForms.lambda = (scope, [params, body]) => {
	if (!params || !body) {
		throw new SyntaxError("Function Body Required");
	}
	params = params.map(value => {
		if (Number(value)) {
			throw new SyntaxError("Parameter names must be variables");
		}
		return value;
	});

	return function () {
		if (arguments.length != params.length) {
			throw new TypeError("Invalid arguments");
		}
		let localScope = Object.create(scope);
		for (let i = 0; i < arguments.length; i++) {
			localScope[params[i]] = arguments[i];
		}
		return interpret(localScope, body)[0];
	};
}

function evaluate(scope, action, args) {
	// console.log('action:', action, 'args:', args);
	if(Number(action)) return Number(action);

	if(typeof action == 'function') return action(...args);

	if(action in specialForms) return specialForms[action](scope, args);

	if(action in scope) {
		const value = scope[action];
		return typeof value === 'function' ? value(...args) : value;
	}
		
	if(action in global.operations)
		return global.operations[action](...args.map(el => evaluate(scope, el)));

	throw new SyntaxError(`Unknown Keyword ${action}`);	
}

const spaceParse = input => input && input.replace(/^\s*|\s*$/, '');

function getWord(input) {
	const word = input.match(/^[^\s)()]+/);
	return word ? [word[0], spaceParse(input.slice(word[0].length))] : [null, spaceParse(input)];
}
function getExpr(input) {
	input = spaceParse(input);
	let brackets = 1, i = 1;
	while(brackets && i < input.length) {
		if(input[i] == '(') brackets++;
		else if(input[i] == ')') brackets--;
		i++;
	}
	if(brackets) return null;
	return [input.slice(0, i), input.slice(i)]
}

function extractDefine(scope, input) {
	let name, value;
	[name, input] = getWord(input);
	[value, input] = interpret(scope, input) || getWord(input);
	return [[name, value], input];
}

function extractLambda(input) {
	let parameters = [], body;
	input = spaceParse(input.slice(1));
	while(input[0]!=')') {
		let value;
		[value, input] = getWord(input);
		parameters.push(value);
	}
	
	[body, input] = getExpr(input.slice(1));
	return [[parameters, body], input];
}

function extractConditional(input) {
	let args = [];
	for(let i=0; i< 3; i++) {
		[args[i], input] = getExpr(input);
	}
	return [args, input];
}

function extractSpecialForm(scope, action, input) {
	switch(action) {
		case 'define': return extractDefine(scope, input);
		case 'lambda': return extractLambda(input);
		default: return extractConditional(input);
	}
}

function interpret(scope, input) {
	if(input[0]!='(') return null;
	input = spaceParse(input.slice(1));

	let action, args = [];
	[action, input] = interpret(scope, input) || getWord(input);

	if(action in specialForms) {
		[args, input] = extractSpecialForm(scope, action, input);
	}
	else {
		while(input && input[0]!=')') {
			let value;
			[value, input] = interpret(scope, input) || getWord(input);
			// console.log('value:', value);
			if(!value) throw Error('What?');
			args.push(evaluate(scope, value));
		}
	}
	if(input) input = input.slice(1);

	return [evaluate(scope, action, args), spaceParse(input)];
}

function run(scope, data) {
	data = data.split('\n').filter(line => line[0]!='#').join(' ');
	while(data) {
		let value;
		[value, data] = interpret(scope, spaceParse(data));
		if(value) console.log(value);
	}
}

const fs = require('fs');
fs.readdir('./lispInterpreter/lisptest', (err, files) => {
	if (err)
			console.log(err);
	else {
		files.forEach(file => {
			console.log(file);
			const data = fs.readFileSync(`./lispInterpreter/lisptest/${file}`);
			run(global, data.toString());
		})
	}
});

/* const readline = require('readline');

const rd = readline.createInterface({
	input: fs.createReadStream('./lispInterpreter/test3.lisp'),
	output: process.stdout,
	console: false
});

rd.on('line', function(line) {
	console.log(line);
}); */