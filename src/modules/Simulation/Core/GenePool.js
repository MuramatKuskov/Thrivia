import { Organic, Remains } from "./EnvironmentObjects.js";
import { Being } from "./Being.js";

export const GenePool = {
	mutate(being) {
		const keys = Object.keys(this);
		let mutation = Math.floor(Math.random() * this.size);
		let DNASection = Math.floor(Math.random() * being.memSize);
		being.genome[DNASection] = { key: keys[mutation], index: mutation };

		mutation = Math.floor(Math.random() * this.size);
		DNASection = Math.floor(Math.random() * being.memSize);
		being.genome[DNASection] = { key: keys[mutation], index: mutation };

		being.hashGenome();
		being.timeSinceMutation = 0;
		being.incrementExpressionPointer(1);
		return 1;
	},

	epigeneticShift(being) {
		let genA = Math.floor(Math.random() * being.memSize);
		let genB = Math.floor(Math.random() * being.memSize);
		being.phenotype[genA] = { key: being.genome[genB].key, index: genB };

		genA = Math.floor(Math.random() * being.memSize);
		genB = Math.floor(Math.random() * being.memSize);
		being.phenotype[genB] = { key: being.genome[genA].key, index: genA };
		being.timeSinceEpigeneticShift = 0;

		being.incrementExpressionPointer(1);
		return 1;
	},

	turn(being) {
		being.direction = Math.floor(Math.random() * 360);
		being.incrementExpressionPointer(2);
		return 0;
	},

	move(being) {
		// if (being.energy < 5) {
		// 	being.incrementExpressionPointer(1);
		// 	return 1;
		// }

		const deltaX = Math.cos(being.direction * Math.PI / 180) * being.speed;
		const deltaY = Math.sin(being.direction * Math.PI / 180) * being.speed;

		// проверка на водоем на пути
		// if (
		// 	being.x + deltaX > being.world.river.x - being.size / 3
		// 	&&
		// 	being.x + deltaX < being.world.river.width - being.size / 3
		// 	&&
		// 	being.y + deltaY > being.world.river.y - being.size / 3
		// 	&&
		// 	being.y + deltaY < being.world.river.height - being.size / 3
		// ) {
		// 	console.log(3);
		// }

		being.x += deltaX;
		being.y += deltaY;

		// world boundaries
		switch (window.simulation.geometry) {
			// closed (torus)
			case 0:
				if (being.x < 0) {
					being.x = window.innerWidth - being.size;
				} else if (being.x > window.innerWidth) {
					being.x = 0 + being.size / 2;
				}

				if (being.y < 0) {
					being.y = window.innerHeight - being.size;
				} else if (being.y > window.innerHeight) {
					being.y = 0;
				}
				break;

			// confined (bordered)
			case 1:
				if (being.x < being.size / 2) {
					being.x = being.size;
				} else if (being.x > window.innerWidth) {
					being.x = window.innerWidth - being.size;
				}

				if (being.y < being.size) {
					being.y = being.size;
				} else if (being.y > window.innerHeight) {
					being.y = window.innerHeight - being.size;
				}
				break;
		}

		being.incrementExpressionPointer(2);
		return 0;
	},

	// polyfill for testing lifespan
	photosynthesis(being) {
		// being.energy += 5;
		// being.health += 7;
		being.incrementExpressionPointer(1);
		return 1;
	},

	// eat anything from environment (organic, remains, minerals?)
	eat(being) {
		let meal;

		// select meal
		window.simulation.environment.forEach((item, index) => {
			if (!(item instanceof Organic) && !(item instanceof Remains)) return;
			if (!being.isPointInSight(item.x, item.y)) return;

			// remember first seen meal
			if (!meal) {
				meal = item;
				meal.index = index;
			}
			// if found something better
			else if (item.energy > meal.energy && item.age < meal.age) {
				meal = item;
				meal.index = index;
			} else if ((item.energy - meal.energy) > (item.age - meal.age) /* && calc dmg from rot < this.health */) {
				meal = item;
				meal.index = index;
			}
		});

		if (meal) {
			being.energy -= 5;
			window.simulation.environment.splice(meal.index, 1);
			being.energy += meal.energy;
			being.health += meal.energy / 3;

			// respawn organic on the map
			if (PARAMETERS.respawnOrganic && meal instanceof Organic) {
				let randX = window.simulation.getRandomPoint('x', window.innerWidth / 250);
				let randY = window.simulation.getRandomPoint('y', window.innerWidth / 250);
				window.simulation.environment.push(new Organic(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, randX, randY, PARAMETERS.organicEnergyValue));
			}

			being.incrementExpressionPointer(2);
			return 1;
		}

		being.incrementExpressionPointer(1);
		return 0;
	},

	hunt(being) {
		let pray;

		// select pray
		window.simulation.population.forEach((target, index) => {
			if (!being.isPointInSight(target.x, target.y)) return;
			if (being.isRelative(target)) return;

			// remember first seen meal
			if (!pray) {
				pray = target;
				pray.index = index;
			}

			// if found something better
			if (target.energy > pray.energy && target.age < pray.age) {
				pray = target;
				pray.index = index;
			} else if ((target.energy - pray.energy) > (target.age - pray.age) /* && calc dmg from rot < this.health */) {
				pray = target;
				pray.index = index;
			}
		});

		if (!pray) {
			being.incrementExpressionPointer(1);
			return 1;
		}

		// const requiredEnergy = pray.energy;
		// being.energy -= requiredEnergy;
		// pray.energy -= requiredEnergy;

		// if (pray.energy > 0 && pray.energy * 2 > being.health) {
		// 	being.isAlive = false;
		// 	return 1;
		// } else if (pray.energy > 0) {
		// 	being.energy -= pray.energy * 2;
		// }

		if (being.energy < pray.energy && being.health < (pray.energy - being.energy) * 2) {
			pray.energy -= being.energy;
			// set energy for correct remains value
			being.energy = 0;
			being.isAlive = false;
			return 1;
		}

		if (being.energy > pray.energy) {
			being.energy -= pray.energy;
		} else {
			being.health -= (pray.energy - being.energy) * 2;
			being.energy = 0;
		}

		window.simulation.population.splice(pray.index, 1);
		being.energy += pray.health * 2;
		being.health += 5;

		being.incrementExpressionPointer(2);
		return 1;
	},

	fission(parent) {
		if (parent.health < 20 || parent.energy < 200) {
			parent.incrementExpressionPointer(1);
			return 1;
		}

		const child = new Being(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, parent.x + Math.floor((Math.random() - 0.5) * 10), parent.y + Math.floor((Math.random() - 0.5) * 10));
		child.genome = parent.genome; // inherit genome
		this.mutate(child);
		child.hashGenome();
		child.initMemory(); // set random phenotype

		parent.health -= 10;
		parent.energy -= 150;

		const queueOrder = window.simulation.population.findIndex(bot => bot.id === parent.id) + 1;
		window.simulation.population.splice(queueOrder, 0, child);

		parent.incrementExpressionPointer(2);
		return 1;
	},
}

Object.defineProperty(GenePool, "size", {
	value: Object.keys(GenePool).length,
	enumerable: false,
});