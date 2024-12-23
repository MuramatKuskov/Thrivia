import { Organic, Remains } from "./EnvironmentObjects.js";
import { Being } from "./Being.js";

export const GenePool = {
	mutate(being) {
		if (Math.random() > 0.33) return;
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
		being.incrementExpressionPointer(1);
		return 0;
	},

	move(being) {
		// enable after negative energy fix
		// if (being.energy < 1) {
		// 	being.incrementExpressionPointer(4);
		// 	return 1;
		// }

		const deltaX = Math.cos(being.direction * Math.PI / 180) * being.speed;
		const deltaY = Math.sin(being.direction * Math.PI / 180) * being.speed;
		let collision = null;

		// check collisions
		window.simulation.population.forEach(bot => {
			if (being.id === bot.id) return;

			// unstuck if collided already
			while (
				being.x + being.size >= bot.x - bot.size &&
				being.x - being.size <= bot.x + bot.size &&
				being.y + being.size >= bot.y - bot.size &&
				being.y - being.size <= bot.y + bot.size
			) {
				being.x += Math.floor((Math.random() * 23) - 15);
				being.y += Math.floor((Math.random() * 23) - 15);
			}

			// calc possible collisions after movement
			if (
				deltaX + being.x + being.size >= bot.x - bot.size &&
				deltaX + being.x - being.size <= bot.x + bot.size &&
				deltaY + being.y + being.size >= bot.y - bot.size &&
				deltaY + being.y - being.size <= bot.y + bot.size
			) {
				return collision = bot;
			}
		});

		if (!collision) {
			being.x += deltaX;
			being.y += deltaY;

			// world boundaries
			switch (window.PARAMETERS.geometry) {
				case "closed":
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
				case "confined":
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

			if (window.PARAMETERS.continuousMovement) {
				let focus = null;

				// remember env
				window.simulation.environment.forEach(object => {
					if (!being.isPointInSight(object.x, object.y)) return;

					object.distance = window.simulation.getDistance(being.x, being.y, object.x, object.y);

					if (
						!focus ||
						// prefer food
						(!(focus instanceof Organic) && !(focus instanceof Remains) &&
							(object instanceof Organic || object instanceof Remains)) ||
						// prefer food in range
						(object instanceof Organic || object instanceof Remains) &&
						focus.distance > being.interactRange && object.distance <= being.interactRange
					) focus = object;
				});
				let neighbour = being.selectBotInSight("foreign", being.targetSelectionStrategy);

				if (neighbour) focus = neighbour;

				if (focus || Math.random() < 0.01) being.incrementExpressionPointer(1);
				return 0;
			}

			// being.energy -= 0.05
			being.incrementExpressionPointer(1);
			return 0;
		}

		if (being.isRelative(collision)) {
			being.incrementExpressionPointer(2);
			return 0;
		} else {
			being.incrementExpressionPointer(3);
			return 1;
		}
	},

	// polyfill for testing lifespan && trash DNA
	photosynthesis(being) {
		// being.energy += 5;
		// being.health += 7;
		being.incrementExpressionPointer(1);
		return 0;
	},

	// eat anything from environment (organic, remains, minerals?)
	// return: 3 if seen nothing; 2 if meal is out of range; 1 if success
	eat(being) {
		let meal;

		// select meal
		window.simulation.environment.forEach((item, index) => {
			if (!(item instanceof Organic) && !(item instanceof Remains)) return;
			if (!being.isPointInSight(item.x, item.y)) return;

			item.distance = window.simulation.getDistance(being.x, being.y, item.x, item.y);

			if (
				// remember first seen meal
				!meal ||
				// if found meal in range
				meal.distance > being.interactRange && item.distance <= being.interactRange ||
				// if found something better
				item.energy > meal.energy && item.age < meal.age ||
				(item.energy - meal.energy) > (item.age - meal.age) /* && calc dmg from rot < this.health */
			) {
				meal = item;
				meal.index = index;
			}
		});

		if (!meal) {
			being.incrementExpressionPointer(3);
			return 0;
		}

		if (meal.distance <= being.interactRange) {
			being.energy -= 2;
			window.simulation.environment.splice(meal.index, 1);
			being.energy += meal.energy;
			being.health += meal.energy / 3;

			meal instanceof Remains ? being.colorShift("red", 25) : being.colorShift("green", 20);

			// respawn organic on the map
			if (PARAMETERS.respawnOrganic && meal instanceof Organic) {
				let randX = window.simulation.getRandomPoint('x', window.innerWidth / 250);
				let randY = window.simulation.getRandomPoint('y', window.innerWidth / 250);
				window.simulation.environment.push(new Organic(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, randX, randY, PARAMETERS.organicEnergyValue));
			}

			being.incrementExpressionPointer(1);
			return 1;
		}

		// food is out of interaction range
		being.incrementExpressionPointer(2);
		return 0;
	},

	hunt(being) {
		// let target;

		// // select pray
		// window.simulation.population.forEach((neighbour, index) => {
		// 	if (!being.isPointInSight(neighbour.x, neighbour.y)) return;

		// 	neighbour.distance = window.simulation.getDistance(being.x, being.y, neighbour.x, neighbour.y);
		// 	neighbour.isRel = being.isRelative(neighbour);

		// 	if (
		// 		// remember first seen target
		// 		!target ||
		// 		// prefer non-relatives over relatives
		// 		(target.distance > being.interactRange && target.isRel && !neighbour.isRel) ||
		// 		// prefer targets that are in range of interaction
		// 		(target.distance > being.interactRange && neighbour.distance <= being.interactRange) ||
		// 		// prefer non-rels in range
		// 		(target.distance <= being.interactRange && target.isRel && !neighbour.isRel && neighbour.distance <= being.interactRange)
		// 	) {
		// 		target = neighbour;
		// 		target.index = index;
		// 	}
		// });

		let target = being.selectBotInSight("foreign", being.targetSelectionStrategy);

		if (!target) {
			being.incrementExpressionPointer(5);
			return 0;
		}
		// non-relative in range
		else if (!target.isRel && target.distance <= being.interactRange) {
			// calculate resources for fight
			if (being.energy < target.energy && being.health < (target.energy - being.energy) * 2) {
				target.energy -= being.energy;
				being.energy = 0;
				being.isAlive = false;
				return 1;
			} else if (being.energy > target.energy) {
				being.energy -= target.energy;
			} else {
				being.health -= (target.energy - being.energy) * 2;
				being.energy = 0;
			}
			// eat pray
			window.simulation.population.splice(target.index, 1);
			being.energy += target.health * 2;
			being.health += 5;
			being.colorShift("red", 15 + target.health / 5);
			being.incrementExpressionPointer(1);
			return 1;
		}
		// non-relative not in range
		else if (!target.isRel) {
			being.incrementExpressionPointer(3);
			return 0;
		}
		// relative not in range
		else if (target.distance > being.interactRange) {
			being.incrementExpressionPointer(4);
			return 0;
		}
		// relative in range
		else {
			being.incrementExpressionPointer(2);
			return 0;
		}
	},

	fission(parent) {
		if (parent.health < 10 || parent.energy < 300) {
			parent.incrementExpressionPointer(2);
			return 1;
		}

		let childX;
		let childY;

		// spawn child near parents and avoid collisions
		do {
			childX = parent.x + Math.floor((Math.random() * 21) - 10);
			childY = parent.y + Math.floor((Math.random() * 21) - 10);
		} while (childX >= -5 && childX <= 5 || childY >= -5 && childY <= 5);

		const child = new Being(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, childX, childY, parent.targetSelectionStrategy);
		// inherit genome & other stats
		child.genome = parent.genome;
		child.c_red = parent.c_red;
		child.c_green = parent.c_green;
		child.c_blue = parent.c_blue;
		this.mutate(child);
		// child.hashGenome();
		// set random phenotype
		child.initMemory();

		if (PARAMETERS.paintScheme === "smell") {
			child.paintSmell();
		} else if (PARAMETERS.paintScheme === "energy") {
			child.paintEnergy();
		} else {
			child.color = `${child.c_red}, ${child.c_green}, ${child.c_blue}`;
		}

		parent.health -= 3;
		parent.energy -= 150;

		const queueOrder = window.simulation.population.findIndex(bot => bot.id === parent.id) + 1;
		window.simulation.population.splice(queueOrder, 0, child);

		parent.incrementExpressionPointer(1);
		return 1;
	},

	// select next action depending on seen
	lookup(being) {
		let focus = null;

		// remember env
		window.simulation.environment.forEach(object => {
			if (!being.isPointInSight(object.x, object.y)) return;

			object.distance = window.simulation.getDistance(being.x, being.y, object.x, object.y);

			if (
				!focus ||
				// prefer food
				(!(focus instanceof Organic) && !(focus instanceof Remains) &&
					(object instanceof Organic || object instanceof Remains)) ||
				// prefer food in range
				(object instanceof Organic || object instanceof Remains) &&
				focus.distance > being.interactRange && object.distance <= being.interactRange
			) focus = object;
		});

		// prefer other bots
		// window.simulation.population.forEach(bot => {
		// 	if (!being.isPointInSight(bot.x, bot.y)) return;

		// 	bot.distance = window.simulation.getDistance(being.x, being.y, bot.x, bot.y);
		// 	bot.isRel = being.isRelative(bot);

		// 	if (
		// 		!focus ||
		// 		// prefer non-relatives over relatives
		// 		(focus.distance > being.interactRange && focus.isRel && !bot.isRel) ||
		// 		// prefer targets that are in range of interaction
		// 		(focus.distance > being.interactRange && bot.distance <= being.interactRange) ||
		// 		// prefer non-rels in range
		// 		(focus.distance <= being.interactRange && focus.isRel && !bot.isRel && bot.distance <= being.interactRange)
		// 	) {
		// 		focus = bot;
		// 	}
		// });

		let neighbour = being.selectBotInSight("foreign", being.targetSelectionStrategy);

		if (neighbour) focus = neighbour;

		// seen nothing
		if (!focus) {
			being.incrementExpressionPointer(9);
			return 0;
		}
		// focus object is out of interaction range
		else if (focus.distance > being.interactRange) {
			// seen food 
			if (focus instanceof Organic || focus instanceof Remains) {
				being.incrementExpressionPointer(7);
				return 0;
			}
			// seen other env object
			else if (!(focus instanceof Being)) {
				being.incrementExpressionPointer(8);
				return 0;
			}
			// seen relative
			else if (focus.isRel) {
				being.incrementExpressionPointer(6);
				return 0;
			}
			// seen foreign
			else {
				being.incrementExpressionPointer(5);
				return 1;
			}
		}
		// focus object is in range
		else {
			// seen food 
			if (focus instanceof Organic || focus instanceof Remains) {
				being.incrementExpressionPointer(3);
				return 0;
			}
			// seen other env object
			else if (!(focus instanceof Being)) {
				being.incrementExpressionPointer(4);
				return 0;
			}
			// seen relative
			else if (focus.isRel) {
				being.incrementExpressionPointer(2);
				return 0;
			}
			// seen foreign
			else {
				being.incrementExpressionPointer(1);
				return 1;
			}
		}
	},

	checkHealth(being) {
		let value = being.health < 30 ? 1 : 2;

		being.incrementExpressionPointer(value);
		return 0;
	},

	checkEnergy(being) {
		let value = being.energy < 30 ? 1 : 2;

		being.incrementExpressionPointer(value);
		return 0;
	},

	geneAttack(being) {
		// let target;

		// window.simulation.population.forEach((bot, index) => {
		// 	if (!being.isPointInSight(bot.x, bot.y)) return;

		// 	bot.distance = window.simulation.getDistance(being.x, being.y, bot.x, bot.y);
		// 	bot.isRel = being.isRelative(bot);

		// 	if (
		// 		// remember first seen target
		// 		!target ||
		// 		// prefer non-relatives over relatives
		// 		(target.distance > being.interactRange && target.isRel && !bot.isRel) ||
		// 		// prefer targets that are in range of interaction
		// 		(target.distance > being.interactRange && bot.distance <= being.interactRange) ||
		// 		// prefer non-rels in range
		// 		(target.distance <= being.interactRange && target.isRel && !bot.isRel && bot.distance <= being.interactRange)
		// 	) {
		// 		target = bot;
		// 		target.index = index;
		// 	}
		// });

		let target = being.selectBotInSight("foreign", being.targetSelectionStrategy);

		if (!target) {
			being.incrementExpressionPointer(5);
			return 0;
		}
		// target is in range — inject genes
		else if (target.distance <= being.interactRange) {
			const range = being.memSize / 8;
			const start = Math.floor(Math.random() * being.memSize);
			being.energy -= 10;
			if (being.energy > 0) {
				for (let i = start; i < range; i++) {
					target.genome[i % target.memSize] = being.genome[i % being.memSize];
				}
			}

			if (target.isRel) {
				being.incrementExpressionPointer(2);
				return 1;
			}

			being.incrementExpressionPointer(1);
			return 1;
		}
		// target is not in range
		else if (!target.isRel) {
			being.incrementExpressionPointer(3);
			return 0;
		} else {
			being.incrementExpressionPointer(4);
			return 0;
		}
	},
}

Object.defineProperty(GenePool, "size", {
	value: Object.keys(GenePool).length,
	enumerable: false,
});