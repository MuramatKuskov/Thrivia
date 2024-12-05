export const GenePool = {
	mutate(being) {
		let mutation = Math.floor(Math.random() * this.size);
		let DNASection = Math.floor(Math.random() * being.memSize);
		being.genome[DNASection] = { key: Object.keys(this)[mutation], index: mutation };

		mutation = Math.floor(Math.random() * this.size);
		DNASection = Math.floor(Math.random() * being.memSize);
		being.genome[DNASection] = { key: Object.keys(this)[mutation], index: mutation };

		being.timeSinceMutation = 0;
		being.incrementExpressionPointer(1);
		return 1;
	},

	epigeneticShift(being) {
		let genA = Math.floor(Math.random() * being.memSize);
		let genB = Math.floor(Math.random() * being.memSize);
		being.phenotype[genA] = genB;
		genA = Math.floor(Math.random() * being.memSize);
		genB = Math.floor(Math.random() * being.memSize);
		being.phenotype[genB] = genA;
		being.timeSinceEpigeneticShift = 0;
		being.incrementExpressionPointer(1);
		return 1;
	},

	turn(being) {
		being.direction = Math.floor(Math.random() * 360);
		being.incrementExpressionPointer(2);
		return 0;
	},

	// после мува осмотреться вокруг и изменить expressionPointer
	// в зависимости от увиденного
	move(being) {
		const deltaX = Math.cos(being.direction) * being.speed;
		const deltaY = Math.sin(being.direction) * being.speed;

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
				if (being.x + being.size / 2 < 0) {
					being.x = window.innerWidth - being.size;
				} else if (being.x + being.size > window.innerWidth) {
					being.x = 0 + being.size / 2;
				}

				if (being.y + being.size < 0) {
					being.y = window.innerHeight - being.size;
				} else if (being.y + being.size > window.innerHeight) {
					being.y = 0;
				}
				break;

			// confined (bordered)
			case 1:
				if (being.x < being.size / 2) {
					being.x = being.size;
				} else if (being.x + being.size > window.innerWidth) {
					being.x = window.innerWidth - being.size;
				}

				if (being.y < being.size) {
					being.y = being.size;
				} else if (being.y + being.size > window.innerHeight) {
					being.y = window.innerHeight - being.size;
				}
				break;
		}

		being.incrementExpressionPointer(1);
		return 1;
	},

	// eat anything from environment (organic, bots, remains, minerals?)
	eat(being) {
		// calc FOV

		// depending on seen:
		// -nrgy 
		// delete env target from world
		// if target = bot:
		// fight bot
		// +nrgy
		// incrPointer

		being.incrementExpressionPointer(2);
		return 1;
	},

	photosynthesis(being) {
		being.energy += 5;
		being.health += 7;
		being.incrementExpressionPointer(1);
		return 1;
	},

	fission(parent) {
		// -health
		// if (health <= 0) return

		// const child = new Being(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, parent.x + Math.floor(Math.random()));
		// child.initMemory(); // set random phenotype
		// child.genome = parent.genome; // inherit genome
		// child.mutate();

		// parent - nrgy, hp, minerals

		// const queueOrder = world.population.findIndex(bot => bot.id === parent.id) + 1;
		// world.population.splice(queueOrder, 0, child);

		parent.incrementExpressionPointer(2);
		return 1;
	},
}

Object.defineProperty(GenePool, "size", {
	value: Object.keys(GenePool).length,
	enumerable: false,
});