import { GenePool } from "./GenePool.js";

const genes = Object.keys(GenePool);

export class Being {
	constructor(id, x, y, size) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.size = size;
		this.health = 100;
		this.energy = 100;
		this.nutritions = 10;
		this.speed = 2;
		this.direction = Math.floor(Math.random() * 360);
		// size of geno- & phenotype arrays
		this.memSize = 32;
		// available (inherited) genes
		this.genome = [];
		// expressed genes
		this.phenotype = [];
		// current expressed gene
		this.expressionPointer = 0;
		this.timeSinceMutation = 0;
		this.timeSinceEpigeneticShift = 0;
		this.age = 0;
		this.isAlive = true;
		// colors, depends on food
		this.c_red = 0;		// predators
		this.c_green = 255;		// herbivores
		this.c_blue = 0;	//	poison catalysts
		this.c_family = 0;	// family
		this.color = `${this.c_red}, ${this.c_green}, ${this.c_blue}`;
	}

	initMemory() {
		while (this.genome.length < this.memSize) {
			let index = Math.floor(Math.random() * GenePool.size);
			this.genome.push({ key: genes[index], index: index });
		}
		while (this.phenotype.length < this.memSize) {
			this.phenotype.push(Math.floor(Math.random() * this.memSize));
		}
	}

	// jump to next action depending on result of current
	conditionalAction(x) {
		const mod = this.genome[this.phenotype[(this.expressionPointer + x) % this.memSize]].index;
		this.incrementExpressionPointer(mod);
	}

	incrementExpressionPointer(x) {
		this.expressionPointer = (this.expressionPointer + x) % this.memSize;
	}

	// main lifetime function, defines behavior
	doSmth() {
		let breakFlag;
		let command;
		for (let cyc = 0; cyc < 15; cyc++) {
			breakFlag = 0;
			command = this.genome[this.phenotype[this.expressionPointer]].index;

			// trash DNA could lead to pool overflow
			// if (GenePool[`${genes[command]}`]) {
			// 	breakFlag = GenePool[`${genes[command]}`](this);
			// } else {
			// 	this.incrementExpressionPointer(1);
			// }

			breakFlag = GenePool[`${genes[command]}`](this);

			// switch (command) {
			// 	case 0:
			// 	case 1:
			// 	case 2:
			// 	case 3:
			// 	case 4:
			// 	case 5:
			// 	case 6:
			// 	case 7:
			// 		this.mutate();
			// 		this.incrementExpressionPointer(1);
			// 		breakFlag = 1;
			// 		break;
			// 	case 9:
			// 	case 10:
			// 	case 11:
			// 	case 12:
			// 	case 13:
			// 	case 14:
			// 	case 15:
			// 	case 16:
			// 	case 17:
			// 	case 18:
			// 	case 19:
			// 		// this.conditionalAction(this.move());
			// 		// breakFlag = 1;
			// 		// тут пока так т.к. мув непонятно что возвр
			// 		this.move();
			// 		this.incrementExpressionPointer(1);
			// 		break;
			// 	// case 16:
			// 	// 	this.fission();
			// 	// 	this.incrActivityPointer(1);
			// 	// 	break;
			// 	case 20:
			// 		this.turn();
			// 		this.incrementExpressionPointer(2);
			// 		break;
			// 	// case 23:
			// 	// case 24:
			// 	// case 25:
			// 	// case 26:
			// 	// 	this.actWithParam(this.move());
			// 	// 	breakFlag = 1;
			// 	// 	break;
			// 	// case 29:
			// 	// 	this.actWithParam(this.swim());
			// 	// 	breakFlag = 1;
			// 	// 	break;
			// 	// case 33:
			// 	// 	this.min2Health();
			// 	// 	this.incrActivityPointer(1);
			// 	// 	breakFlag = 1;
			// 	// 	break;
			// 	// case 34:
			// 	// case 35:
			// 	// 	this.actWithParam(this.eat());
			// 	// 	breakFlag = 1;
			// 	// 	break;
			// 	// case 36:
			// 	// case 37:
			// 	// 	this.actWithParam(this.giveRes());
			// 	// 	break;
			// 	// case 38:
			// 	// case 39:
			// 	// 	this.actWithParam(this.mergeRes());
			// 	// 	break;
			// 	// case 40:
			// 	// 	this.actWithParam(this.look());
			// 	// 	break;
			// 	// case 41:
			// 	// 	this.actWithParam(this.poison2Food());
			// 	// 	breakFlag = 1;
			// 	// 	break;
			// 	// case 42:
			// 	// 	this.actWithParam(this.checkHP());
			// 	// 	break;
			// 	// case 43:
			// 	// 	this.actWithParam(this.checkMinerals());
			// 	// 	break;
			// 	// case 46:
			// 	// 	this.actWithParam(this.isEncirclemented());
			// 	// 	break;
			// 	// case 52:
			// 	// 	this.genAttack();
			// 	// 	this.incrActivityPointer(1);
			// 	// 	breakFlag = 1;
			// 	// 	break;
			// 	default:
			// 		this.incrementExpressionPointer(1);
			// 		break;
			// }
			if (breakFlag === 1) break;
		}

		// выход из функции
		// действия перед передачей контроля следующему боту
		if (this.isAlive) {
			this.age = this.age + 1;
			this.timeSinceMutation = this.timeSinceMutation + 1;
			// если накопилось много энергии - дать потомство
			// if (this.health > 999) {
			// 	this.fission();
			// }
			// молодые тратят 1 энергии на ход, пожилые - 3
			this.energy = this.age < 600 ? this.energy - 1 : this.energy - 3;
			// если энергии недостаточно для переваривания нутриентов - бот умирает?
			// а стоит ли хардкодить тут это самое переваривание?
			// после этого возраста есть рандомный шанс пригрустить
			if (this.age > 1000) {
				if (Math.random() < 0.2) {
					this.health = this.health - 15;
					return;
				}
			}
			if (this.health <= 0) {
				this.isAlive = false;
				return;
			}
		}
	}

	// mutate() {
	// 	let genA = Math.floor(Math.random() * this.memSize);
	// 	let genB = Math.floor(Math.random() * this.memSize);
	// 	this.phenotype[genA] = genB;
	// 	genA = Math.floor(Math.random() * this.memSize);
	// 	genB = Math.floor(Math.random() * this.memSize);
	// 	this.phenotype[genB] = genA;
	// 	this.timeSinceMutation = 0;
	// }

	// // после мува осмотреться вокруг и вернуть число
	// // в зависимости от увиденного
	// move() {
	// 	const deltaX = Math.cos(this.direction) * this.speed;
	// 	const deltaY = Math.sin(this.direction) * this.speed;

	// 	// проверка на водоем на пути
	// 	// if (
	// 	// 	this.x + deltaX > this.world.river.x - this.size / 3
	// 	// 	&&
	// 	// 	this.x + deltaX < this.world.river.width - this.size / 3
	// 	// 	&&
	// 	// 	this.y + deltaY > this.world.river.y - this.size / 3
	// 	// 	&&
	// 	// 	this.y + deltaY < this.world.river.height - this.size / 3
	// 	// ) {
	// 	// 	console.log(3);
	// 	// }

	// 	this.x += deltaX;
	// 	this.y += deltaY;

	// 	// world boundaries
	// 	switch (window.simulation.geometry) {
	// 		// closed (torus)
	// 		case 0:
	// 			if (this.x + this.size / 2 < 0) {
	// 				this.x = window.innerWidth - this.size;
	// 			} else if (this.x + this.size > window.innerWidth) {
	// 				this.x = 0 + this.size / 2;
	// 			}

	// 			if (this.y + this.size < 0) {
	// 				this.y = window.innerHeight - this.size;
	// 			} else if (this.y + this.size > window.innerHeight) {
	// 				this.y = 0;
	// 			}
	// 			break;

	// 		// confined (bordered)
	// 		case 1:
	// 			if (this.x < this.size / 2) {
	// 				this.x = this.size;
	// 			} else if (this.x + this.size > window.innerWidth) {
	// 				this.x = window.innerWidth - this.size;
	// 			}

	// 			if (this.y < this.size) {
	// 				this.y = this.size;
	// 			} else if (this.y + this.size > window.innerHeight) {
	// 				this.y = window.innerHeight - this.size;
	// 			}
	// 			break;
	// 	}
	// }

	// turn() {
	// 	this.direction = Math.floor(Math.random() * 360);
	// }
}