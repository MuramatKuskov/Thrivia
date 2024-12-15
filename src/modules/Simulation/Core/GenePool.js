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
		if (being.energy < 1) {
			being.incrementExpressionPointer(4);
			return 1;
		}

		const deltaX = Math.cos(being.direction * Math.PI / 180) * being.speed;
		const deltaY = Math.sin(being.direction * Math.PI / 180) * being.speed;
		let collision = null;

		// avoid collisions
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

			being.energy -= 0.05
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
			if (!being.isPointInSight(item.x, item.y, being.interactRangeMod)) return;

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

			being.incrementExpressionPointer(2);
			return 1;
		}

		being.incrementExpressionPointer(1);
		return 0;
	},

	hunt(being) {
		let target;

		// select pray
		window.simulation.population.forEach((neighbour, index) => {
			if (!being.isPointInSight(neighbour.x, neighbour.y)) return;
			// if (being.isRelative(neighbour)) return;

			// remember first seen meal
			if (!target || being.isRelative(target) && !being.isRelative(neighbour)) {
				target = neighbour;
				target.index = index;
			}

			// if found something better
			if (neighbour.energy > target.energy && neighbour.age < target.age) {
				target = neighbour;
				target.index = index;
			} else if ((neighbour.energy - target.energy) > (neighbour.age - target.age) /* && calc dmg from rot < this.health */) {
				target = neighbour;
				target.index = index;
			}
		});

		// exit if no targets or target is relative
		if (!target) {
			being.incrementExpressionPointer(2);
			return 0;
		} else if (being.isRelative(target)) {
			being.incrementExpressionPointer(3);
			return 1;
		}

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
		being.colorShift("red", 25 + target.health / 4);

		being.incrementExpressionPointer(1);
		return 1;
	},

	fission(parent) {
		if (parent.health < 20 || parent.energy < 200) {
			parent.incrementExpressionPointer(2);
			return 1;
		}

		let childX;
		let childY;

		// spawn child near parents and avoid collision
		do {
			childX = parent.x + Math.floor((Math.random() * 21) - 10);
			childY = parent.y + Math.floor((Math.random() * 21) - 10);
		} while (childX >= -5 && childX <= 5 || childY >= -5 && childY <= 5);

		const child = new Being(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, childX, childY);
		child.genome = parent.genome; // inherit genome
		this.mutate(child);
		child.hashGenome();
		child.initMemory(); // set random phenotype

		if (PARAMETERS.paintScheme === "smell") {
			child.paintSmell();
		} else if (PARAMETERS.paintScheme === "energy") {
			child.paintEnergy();
		}

		parent.health -= 10;
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

			if (!focus) return focus = object;

			if (
				!(focus instanceof Organic) && !(focus instanceof Remains) &&
				object instanceof Organic || object instanceof Remains
			) return focus = object;
		});

		// remember other bots
		window.simulation.population.forEach(bot => {
			if (!being.isPointInSight(bot.x, bot.y)) return;


			if (!focus) {
				focus = bot;
				focus.isRel = being.isRelative(bot, Math.random() < 0.5 ? true : false);
			} else if (focus.isRelative && !being.isRelative(bot, Math.random() < 0.5 ? true : false)) {
				focus = bot;
				focus.isRel = false;
			}
		});

		// seen nothing
		if (!focus) {
			being.incrementExpressionPointer(1);
			return 0;
		}
		// seen food 
		else if (focus instanceof Organic || focus instanceof Remains) {
			being.incrementExpressionPointer(2);
			return 0;
		}
		// seen other env object
		else if (!(focus instanceof Being)) {
			being.incrementExpressionPointer(3);
			return 0;
		}
		// seen relative
		else if (focus.isRel) {
			being.incrementExpressionPointer(4);
			return 0;
		}
		// seen foreign
		else {
			being.incrementExpressionPointer(5);
			return 1;
		}
	},
}

Object.defineProperty(GenePool, "size", {
	value: Object.keys(GenePool).length,
	enumerable: false,
});