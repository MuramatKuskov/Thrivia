import { GenePool } from "./GenePool.js";

const genes = Object.keys(GenePool);

export class Being {
	constructor(id, x, y) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.size = PARAMETERS.beingSizeMin;
		/* STATS */
		this.health = 100;
		this.energy = 100;
		this.nutritions = 10;
		this.FOV = 60;				 // degrees
		this.rangeOfSight = 35; // px
		this.rangeOfInteract = 10; // px
		this.speed = 2;
		this.direction = Math.floor(Math.random() * 360);
		// size of geno- & phenotype arrays
		this.memSize = 32;
		// available (inherited) genes
		this.genome = [];
		this.genomeHashed = 0;
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
		this.statusColor = "orange";
	}

	initMemory(genome = false) {
		if (genome) {
			while (this.genome.length < this.memSize) {
				let index = Math.floor(Math.random() * GenePool.size);
				this.genome.push({ key: genes[index], index: index });
			}
			this.hashGenome();
		}

		while (this.phenotype.length < this.memSize) {
			let index = Math.floor(Math.random() * this.memSize);
			this.phenotype.push({ key: genes[this.genome[index].index], index: index });
		}
	}

	hashGenome() {
		this.genomeHashed = 0;
		this.genome.forEach(x => this.genomeHashed += x.index);
	}

	// jump to next action depending on result of current
	conditionalAction(x) {
		const mod = this.genome[this.phenotype[(this.expressionPointer + x) % this.memSize].index].index;
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
			command = this.genome[this.phenotype[this.expressionPointer].index].index;

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
			// if (this.energy > 999) {
			// 	GenePool.fission(this);
			// }

			this.energy = this.age < 1500 ? this.energy - 2 : this.energy - 5;

			if (PARAMETERS.allowGrowth) this.size = Math.max(PARAMETERS.beingSizeMin, Math.min(PARAMETERS.beingSizeMin * (this.energy / 100), PARAMETERS.beingSizeMax));

			// рандомный шанс пригрустить для пожилых
			if (this.age > 9000) {
				if (Math.random() < 0.15) {
					this.health = this.health - 15;
					return;
				}
			} else if (this.age > 2000) {
				if (Math.random() < 0.1) {
					this.health = this.health - 2;
					return;
				}
			}
			if (this.health <= 0) {
				// если энергии недостаточно для переваривания нутриентов - бот умирает?
				// а стоит ли хардкодить тут это самое переваривание?
				this.isAlive = false;
				return;
			}
		}
	}

	// written with help of AI
	// returns coordinates from center of bot to edges of eyesight
	getAreaOfSight() {
		const radians = (this.FOV * Math.PI) / 180;
		const directionRadians = (this.direction * Math.PI) / 180;

		// Calculate the direction vector
		const directionX = Math.cos(directionRadians);
		const directionY = Math.sin(directionRadians);

		// Calculate the extents of the visible area
		const leftX = this.x + directionX * this.rangeOfSight * Math.cos(radians / 2) - directionY * this.rangeOfSight * Math.sin(radians / 2);
		const leftY = this.y + directionY * this.rangeOfSight * Math.cos(radians / 2) + directionX * this.rangeOfSight * Math.sin(radians / 2);
		const rightX = this.x + directionX * this.rangeOfSight * Math.cos(radians / 2) + directionY * this.rangeOfSight * Math.sin(radians / 2);
		const rightY = this.y + directionY * this.rangeOfSight * Math.cos(radians / 2) - directionX * this.rangeOfSight * Math.sin(radians / 2);

		return { leftX, leftY, rightX, rightY };
	}

	// written with help of AI
	isPointInSight(x, y) {
		// Calculate the direction vector of the bot
		const directionX = Math.cos(this.direction * Math.PI / 180);
		const directionY = Math.sin(this.direction * Math.PI / 180);

		// Calculate the vector from the bot to the object
		const objectVectorX = x - this.x;
		const objectVectorY = y - this.y;

		// Calculate the dot product
		const dotProduct = directionX * objectVectorX + directionY * objectVectorY;

		// Calculate the magnitude of the object vector
		const objectDistance = Math.sqrt(objectVectorX * objectVectorX + objectVectorY * objectVectorY);

		// Check if the angle is within the FOV and the distance is within the range of sight
		if (
			!(
				Math.acos(dotProduct / objectDistance) * 180 / Math.PI <= this.FOV / 2 &&
				objectDistance <= this.rangeOfSight
			)
		) return false;

		// Calculate the distance between the midpoint and the object
		const dx = x - this.x;
		const dy = y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Check if the distance is within the maximum range
		return distance <= this.rangeOfSight;
	}

	isRelative(being) {
		if (Math.abs(this.genomeHashed - being.genomeHashed) > GenePool.size) return false;

		let n = 0;
		for (let i = 0; i < this.genome.length; i++) {
			if (this.genome[i].index !== being.genome[i].index) n = n + 1;
			if (n > PARAMETERS.populationRelativityGap) return false;
		}

		return true;
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