
module genetics {


	export class Context {

		values: { [key: string]: number; } = {};

		get(key: string): number {
			return this.values[key];
		}

		set(key: string, value: number): void {
			this.values[key] = value;
		}
	}

	export enum NodeType {
		FUNC,
		TERM
	}

	export class Node {

		value: Term|Func;
		children: Node[];

		constructor(value: Term|Func, children: Node[] = []) {
			this.value = value;
			this.children = children;
		}

		set(other: Node): void {
			this.value = other.value;
			this.children = other.children;
		}

		copy(): Node {
			let value = this.value;
			let children = this.children.map(child => child.copy());
			return new Node(value, children);
		}

		getType(): NodeType {
			if (this.value instanceof Term) {
				return NodeType.TERM;
			}
			else if (this.value instanceof Func) {
				return NodeType.FUNC;
			}
			else {
				throw new Error("invalid node value");
			}
		}
	}

	export class Term {
		getValue(context: Context): number {
			throw new Error("getValue() must be overridden in child class");
		}

		toString(): string {
			throw new Error("toString() must be overridden in child class");
		}
	}

	export class ConstantTerm extends Term {

		private value: number;

		constructor(value: number) {
			super();
			this.value = value;
		}

		getValue(context: Context): number {
			return this.value;
		}

		toString(): string {
			return this.value.toString();
		}
	}

	export class InputTerm extends Term {

		private name: string;

		constructor(name: string) {
			super();
			this.name = name;
		}

		getValue(context: Context): number {
			return context.get(this.name);
		}

		toString(): string {
			return this.name;
		}

	}

	export class TermRegistry {

		private terminals: Term[] = [];

		register(term: Term): void {
			this.terminals.push(term);
		}

		random(): Term {
			let i = Math.floor(Math.random() * this.terminals.length);
			return this.terminals[i];
		}

		size(): number {
			return this.terminals.length;
		}
	}

	export class Func {

		public arity: number;
		private func: Function;
		private name: string;

		constructor(name: string, func: Function) {
			this.name = name;
			this.func = func;
			this.arity = func.length;
			if (func.length > 2) {
				console.log("too long");
			}
		}

		execute(args: number[]): number {
			return this.func.apply(null, args);
		}

		toString(): string {
			return this.name;
		}

	}

	export class FuncRegistry {

		private functions: Func[] = [];

		register(func: Func): void {
			this.functions.push(func);
		}

		random(): Func {
			let i = Math.floor(Math.random() * this.functions.length);
			return this.functions[i];
		}

		size(): number {
			return this.functions.length;
		}
	}

	export enum GenerateMethod {
		GROW,
		FULL
	}

	export function generateExpression(funcs: FuncRegistry, terms: TermRegistry, maxDepth: number, method: GenerateMethod): Node {
		if (maxDepth === 0 || (
			method === GenerateMethod.GROW &&
			Math.random() < (terms.size() / (terms.size() + funcs.size()))
		)) {
			return new Node(terms.random());
		} else {
			let func = funcs.random();
			let args: Node[] = [];
			for (let i = 0; i < func.arity; i++) {
				args[i] = generateExpression(funcs, terms, maxDepth - 1, method);
			}
			return new Node(func, args);
		}
	}

	export function serializeExpression(node: Node): string {
		switch (node.getType()) {
			case NodeType.FUNC:
				let func = <Func>node.value;
				let args = node.children.map(serializeExpression);
				return "(" + func.toString() + " " + args.join(" ") + ")";
			case NodeType.TERM:
				return node.value.toString();
			default:
				throw new Error("invalid node type");
		}
			
	}

	export function evaluateExpression(node: Node, context: Context): number {
		switch (node.getType()) {
			case NodeType.FUNC:
				let func = <Func>node.value;
				let args = node.children.map((child: Node): number => {
					return evaluateExpression(child, context);
				});
				return func.execute(args);
			case NodeType.TERM:
				let term = <Term>node.value;
				return term.getValue(context);
			default:
				throw new Error("invalid node type");
		}
	}

	function walkExpression(node: Node, callback: (node: Node) => void): void {
		callback(node);
		node.children.forEach(child => walkExpression(child, callback));
	}

	export function selectRandomNode(root: Node): Node {
		let count = 0;
		let selected = root;
		walkExpression(root, (node: Node) => {
			count++;
			let rand = Math.floor(Math.random() * (count + 1));
			if (rand === count) {
				selected = node;
			}
		});
		return selected;
	}

	export function mutateExpression(root: Node, funcs: FuncRegistry, terms: TermRegistry, maxDepth: number, method: GenerateMethod): Node {
		// create copy for mutation
		let copy = root.copy();

		// select node to be replaced
		let subExpression = selectRandomNode(copy);

		// create new random node
		let newExpression = generateExpression(funcs, terms, maxDepth, method);

		// replace selected node with random node
		subExpression.set(newExpression);

		return copy;
	}

}

let funcs = new genetics.FuncRegistry();

funcs.register(
	new genetics.Func("ADD", (a: number, b: number): number => {
		return a + b;
	}));

funcs.register(
	new genetics.Func("SUBTRACT", (a: number, b: number): number => {
		return a - b;
	}));

funcs.register(
	new genetics.Func("DIVIDE", (a: number, b: number): number => {
		return a / b;
	}));

funcs.register(
	new genetics.Func("MULTIPLY", (a: number, b: number): number => {
		return a * b;
	}));

// funcs.register(
// 	new genetics.Func("SQRT", (a: number) => Math.sqrt(a)));

// funcs.register(
// 	new genetics.Func("SIN", (a: number) => Math.sin(a)));

// funcs.register(
// 	new genetics.Func("COS", (a: number) => Math.cos(a)));

// funcs.register(
// 	new genetics.Func("LOG", (a: number) => Math.log(a)));

// funcs.register(
// 	new genetics.Func("POW", (a: number, b: number) => Math.pow(a, b)));

// funcs.register(
// 	new genetics.Func("ABS", (a: number) => Math.abs(a)));

// funcs.register(
// 	new genetics.Func("FLOOR", (a: number) => Math.floor(a)));

// funcs.register(
// 	new genetics.Func("CEIL", (a: number) => Math.ceil(a)));

// funcs.register(
// 	new genetics.Func("MAX", (a: number, b: number) => Math.max(a, b)));

// funcs.register(
// 	new genetics.Func("MIN", (a: number, b: number) => Math.min(a, b)));


let terms = new genetics.TermRegistry();

terms.register(new genetics.ConstantTerm(4));
terms.register(new genetics.ConstantTerm(134));
terms.register(new genetics.ConstantTerm(42));
terms.register(new genetics.ConstantTerm(Math.PI));
terms.register(new genetics.ConstantTerm(10000));

terms.register(new genetics.InputTerm("X"));
terms.register(new genetics.InputTerm("Y"));

let context = new genetics.Context();

context.set("X", 100);
context.set("Y", 200);

let target = 3934.45634;
let closest = Infinity;

let count = 0;

let population: genetics.Node[] = [];

const POPULATION_SIZE = 10000;

for (let i = 0; i < POPULATION_SIZE; i++) {
	let expr = genetics.generateExpression(funcs, terms, 20, genetics.GenerateMethod.GROW);
	population.push(expr);
}

while (true) {

	// try all the expressions
	let errors = population.map((expr) => {
		let result = genetics.evaluateExpression(expr, context);
		let error = Math.abs(result - target);
		if (error < closest) {
			closest = error;
			console.log("closest:", closest);
			if (error === 0) {
				console.log(genetics.serializeExpression(expr));
				throw new Error("found it!");
			}
		}
		return {
			error: error,
			node: expr
		};
	});

	// sort them based on error
	errors.sort((a, b) => {
		if (a.error < b.error) {
			return -1;
		}
		else if (a.error > b.error) {
			return 1;
		}
		return 0;
	});

	// choose the top 100 for breeding
	let parents = errors.slice(0, 100).map(parent => parent.node);

	population = [];

	// add all parents to the next population
	parents.forEach((parent) => population.push(parent));

	while(population.length < POPULATION_SIZE) {
		let i = Math.floor(Math.random() * parents.length);
		let parent = parents[i];
		let offspring = genetics.mutateExpression(parent, funcs, terms, 20, genetics.GenerateMethod.GROW);
		population.push(offspring);
	}


}

