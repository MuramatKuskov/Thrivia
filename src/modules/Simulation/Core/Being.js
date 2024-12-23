import { GenePool } from "./GenePool.js";

const genes = Object.keys(GenePool);

export class Being {
	constructor(id, x, y, targetSelectionStrategy) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.size = PARAMETERS.beingSizeMin;
		/* STATS */
		this.health = 100;
		this.energy = 100;
		this.nutritions = 10;
		this.FOV = 60;				 // degrees
		this.rangeOfSight = 66; // px
		this.interactRange = this.rangeOfSight * 0.55; // px
		this.targetSelectionStrategy = targetSelectionStrategy;
		this.speed = 2;
		this.direction = Math.floor(Math.random() * 360);
		// size of geno- & phenotype arrays
		this.memSize = window.PARAMETERS.memSize;
		// available (inherited) genes
		this.genome = [];
		// genome hash
		this.smell = 0;
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
			// this.hashGenome();
		}

		while (this.phenotype.length < this.memSize) {
			let index = Math.floor(Math.random() * this.memSize);
			this.phenotype.push({ key: genes[this.genome[index].index], index: index });
		}
	}

	hashGenome() {
		this.smell = 0;
		this.genome.forEach((gene, index) => this.smell += gene.index * index / this.memSize);
		// console.log(this.smell);
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
		for (let cyc = 0; cyc < 5; cyc++) {
			breakFlag = 0;
			command = this.genome[this.phenotype[this.expressionPointer].index].index;

			// if (this.statusColor === "blue") {
			// 	console.log(`CURR: ${this.phenotype[this.expressionPointer].key}`);
			// }

			// trash DNA could lead to pool overflow
			// if (GenePool[`${genes[command]}`]) {
			// 	breakFlag = GenePool[`${genes[command]}`](this);
			// } else {
			// 	this.incrementExpressionPointer(1);
			// }

			breakFlag = GenePool[`${genes[command]}`](this);

			// if (this.statusColor === "blue" && cyc === 15) {
			// 	console.log(`NEXT: ${this.phenotype[this.expressionPointer].key}`);
			// }

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
			if (breakFlag === 1) {
				// if (this.statusColor === "blue") {
				// 	console.log(`FNEXT: ${this.phenotype[this.expressionPointer].key}`);
				// }
				break;
			}
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

			this.energy = this.age < 1500 ? this.energy - 0.1 : this.energy - 0.5;

			if (window.PARAMETERS.allowGrowth) this.updateSize(true);

			if (this.energy < 0) this.health -= 0.5
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

	updateSize(allowGrowth) {
		if (!allowGrowth) return this.size = window.PARAMETERS.beingSizeMin;
		this.size = Math.max(PARAMETERS.beingSizeMin, Math.min(PARAMETERS.beingSizeMin * (this.energy / 200), PARAMETERS.beingSizeMax));
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

		return true;
	}

	isRelative(being, strongMatch = true) {
		// if (Math.abs(this.smell - being.smell) > GenePool.size) return false;

		// check before mating?
		if (strongMatch) {
			let n = 0;
			for (let i = 0; i < this.genome.length; i++) {
				if (this.genome[i].index !== being.genome[i].index) n = n + 1;
				if (n > PARAMETERS.populationRelativityGap) return false;
			}
		}

		return true;
	}

	selectBotInSight(preference, strategy) {
		let target = null;

		window.simulation.population.forEach((bot, index) => {
			if (!this.isPointInSight(bot.x, bot.y)) return;
			// if (bot.age < 30) return;

			bot.distance = window.simulation.getDistance(this.x, this.y, bot.x, bot.y);
			bot.isRel = this.isRelative(bot);

			// Близко соотв -> далеко соотв -> близко несоотв -> далеко несоотв
			// Блзк с -> блзк нс -> длк с -> длк нс

			if (
				// remember first seen target
				!target ||
				(
					// switch from anybody far to anybody closer
					strategy === "reactive" && target.distance > this.interactRange && bot.distance <= this.interactRange
				) ||
				(
					preference === "foreign" &&
					(
						strategy !== "reactive" &&
						(
							// switch from any relative to any non-relative
							(target.isRel && !bot.isRel) ||
							// switch from far to close non-rel
							(target.distance > this.interactRange && !bot.isRel && bot.distance <= this.interactRange)
						)
					) ||
					(
						strategy === "reactive" &&
						// switch from rel to close non-rel
						target.isRel && !bot.isRel && bot.distance <= this.interactRange
					)
				) ||
				(
					preference === "relative" &&
					(
						strategy === "cautious" &&
						// switch only to close rel if foreign in sight
						!target.isRel && bot.isRel && bot.distance <= this.interactRange
					) ||
					(
						strategy === "reactive" &&
						// switch from non-rel to close rel
						!target.isRel && bot.isRel && bot.distance <= this.interactRange
					) ||
					(
						strategy === "persistent" &&
						// switch from any non-rel to any rel
						(!target.isRel && bot.isRel) ||
						// switch from far to close rel
						(target.distance > this.interactRange && bot.isRel && bot.distance <= this.interactRange)
					)
				)
				// (
				// 	// select relatives only when foreigns are far
				// 	strategy === "cautious" && (
				// 		(
				// 			preference === "foreign" &&
				// 			(
				// 				// switch from any relative to any non-relative
				// 				(target.isRel && !bot.isRel) ||
				// 				// switch from far to close non-rel
				// 				(target.distance > this.interactRange && !bot.isRel && bot.distance <= this.interactRange)
				// 			)
				// 		) ||
				// 		(
				// 			preference === "relative" &&
				// 			// switch only to close rel if foreign in sight
				// 			!target.isRel && bot.isRel && bot.distance <= this.interactRange
				// 		)
				// 	)
				// ) ||
				// (
				// 	// select in range if possible
				// 	strategy === "reactive" && (
				// 		// switch from anybody far to anybody closer
				// 		(target.distance > this.interactRange && bot.distance <= this.interactRange) ||
				// 		(
				// 			preference === "foreign" &&
				// 			// switch from rel to close non-rel
				// 			(target.isRel && !bot.isRel && bot.distance <= this.interactRange)
				// 		) ||
				// 		(
				// 			preference === "relative" &&
				// 			// switch from non-rel to close rel
				// 			(!target.isRel && bot.isRel && bot.distance <= this.interactRange)
				// 		)
				// 	)
				// ) ||
				// (
				// 	// select preferred if possible
				// 	strategy === "persistent" && (
				// 		(
				// 			preference === "foreign" &&
				// 			(
				// 				// switch from any rel to any non-rel
				// 				(target.isRel && !bot.isRel) ||
				// 				// switch from far to close non-rel
				// 				(target.distance > this.interactRange && !bot.isRel && bot.distance <= this.interactRange)
				// 			)
				// 		) ||
				// 		(
				// 			preference === "relative" &&
				// 			// switch from any non-rel to any rel
				// 			(!target.isRel && bot.isRel) ||
				// 			// switch from far to close rel
				// 			(target.distance > this.interactRange && bot.isRel && bot.distance <= this.interactRange)
				// 		)
				// 	)
				// )
			) {
				target = bot;
				target.index = index;
			}
		});

		return target;
	}

	colorShift(incrementColor, value) {
		switch (incrementColor) {
			case "green":
				this.c_green += value;
				if (this.c_green > 255) this.c_green = 255;
				this.c_red -= value;
				if (this.c_red < 0) this.c_red = 0;
				this.c_blue -= value;
				if (this.c_blue < 0) this.c_blue = 0;
				break;
			case "red":
				this.c_red += value;
				if (this.c_red > 255) this.c_gred = 255;
				this.c_green -= value;
				if (this.c_green < 0) this.c_green = 0;
				this.c_blue -= value;
				if (this.c_blue < 0) this.c_blue = 0;
				break;
			case "blue":
				this.c_blue += value;
				if (this.c_blue > 255) this.c_blue = 255;
				this.c_red -= value;
				if (this.c_red < 0) this.c_red = 0;
				this.c_green -= value;
				if (this.c_green < 0) this.c_green = 0;
				break;
		}

		if (PARAMETERS.paintScheme === "default") this.color = `${this.c_red}, ${this.c_green}, ${this.c_blue}`;
	}

	// written with help of AI
	// paintSmell() {
	// 	// 50 and 165 magic numbers
	// 	// when pool size = 8 smells are lying in that range
	// 	const mod = GenePool.size * (GenePool.size - GenePool.size);

	// 	// const mean = this.memSize * (GenePool.size / 2);
	// 	// const deviation = this.smell - mean;

	// 	// const normalized = (value - 50) / (165 - 50);
	// 	const normalized = (this.smell - mod) / ((this.memSize * GenePool.size) - mod) * 2;

	// 	// this.color = `255, 255, ${normalized * 255}`;
	// 	this.color = `${255 - 255 * normalized}, ${255 - 255 * normalized}, 255`;
	// }

	// written with help of AI
	paintEnergy() {
		if (this.energy < 0) return this.color = `95, 35, 55`;

		const normalized = this.energy / 300;

		// Return the RGB color as a string
		this.color = `255, ${255 - 255 * normalized}, ${255 - 255 * normalized}`;
	}
}