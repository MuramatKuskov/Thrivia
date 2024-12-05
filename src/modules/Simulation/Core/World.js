import { Being } from "./Being.js";
import { Organic, Remains } from "./EnvironmentObjects.js";
import { GenePool } from "./GenePool.js";

export class World {
	constructor(PARAMETERS) {
		this.geometry = PARAMETERS.geometry;
		// this.forestCover = PARAMETERS.forestCover * 100;
		// this.newTreeSize = window.innerWidth / 135;
		this.population = Array(PARAMETERS.population);
		this.botSize = PARAMETERS.botSize;
		this.initialOrganic = PARAMETERS.initialOrganic;
		this.environment = [];
		// this.river = {
		// 	x: 0,
		// 	y: window.innerHeight / 4,
		// 	width: window.innerWidth,
		// 	height: window.innerHeight / 4
		// };
		this.age = 0;
		this.isLive = false;
		this.fillStyle = "aqua";
	}

	init() {
		// trees
		// for (let i = 0; i < this.forestCover; i++) {
		// 	const [x, y] = this.getPointOutsideArea(this.newTreeSize, this.river);
		// 	this.staticMisc.push({ type: "tree", x: x, y: y, size: this.newTreeSize });
		// }

		// beings
		for (let i = 0; i < this.population.length; i++) {
			const [x, y] = this.getPointOutsideArea(this.botSize, this.population);
			const being = new Being(i, x, y, this.botSize);
			being.initMemory();
			this.population[i] = being;
		}

		// organic
		for (let i = 0; i < this.initialOrganic; i++) {
			const size = window.innerWidth / 250;
			let x = this.getRandomPoint('x', size);
			let y = this.getRandomPoint('y', size);
			this.environment.push(new Organic(i, x, y, size));
		}

		this.renderCurrentFrame();
	}

	getRandomPoint(axis, subjectSize) {
		if (axis !== "x" && axis !== "y") {
			throw new Error("Valid axis required ('x' or 'y')");
		}

		let c;
		if (axis === "x") {
			c = Math.random() * (window.innerWidth - subjectSize);
		} else {
			c = Math.random() * (window.innerHeight - subjectSize);
		}
		return c;
	}

	getPointOutsideArea(subjectSize, area) {
		let x = this.getRandomPoint('x', subjectSize);
		let y = this.getRandomPoint('y', subjectSize);

		// detect collisions with multiple objects
		if (Array.isArray(area)) {
			area.forEach(entry => handleCollision(x, y, entry))
		} else {
			handleCollision(x, y, area)
		}

		function handleCollision(x, y, avoid) {
			while (
				x > avoid.x - subjectSize / 3
				&&
				x < avoid.width - subjectSize / 3
			) {
				x = this.getRandomPoint('x', subjectSize);
			}
			while (
				y > avoid.y - subjectSize / 3
				&&
				y < avoid.y + avoid.height - subjectSize / 3
			) {
				y = this.getRandomPoint('y', subjectSize);
			}
		}

		return [x, y]
	}

	// example
	drawRiver() {
		window.ctx.fillStyle = '#0000FF';
		window.ctx.fillRect(this.river.x, this.river.y, this.river.width, this.river.height);

		// window.ctx.strokeStyle = "red";
		// window.ctx.beginPath();
		// window.ctx.moveTo(this.river.x, this.river.y);
		// window.ctx.lineTo(this.river.width, this.river.y);
		// window.ctx.lineTo(this.river.width, this.river.height);
		// window.ctx.lineTo(this.river.x, this.river.height);
		// window.ctx.fill();
		// window.ctx.stroke();

		// window.ctx.beginPath();
		// window.ctx.moveTo(0, window.innerHeight / 7);
		// ctx.lineTo(window.innerWidth / 2, window.innerHeight / 20);
		// ctx.lineTo(window.innerWidth, window.innerHeight / 4.75);
		// ctx.lineTo(window.innerWidth, window.innerHeight / 2.8);
		// ctx.lineTo(window.innerWidth / 1.8, window.innerHeight / 4.7);
		// ctx.lineTo(window.innerWidth / 2.3, window.innerHeight / 2.6);
		// ctx.lineTo(0, window.innerHeight / 3);
		// ctx.fill();

		// Рисование волн
		for (let i = 0; i < window.innerWidth / 20; i++) {
			const waveWidth = Math.random() * 15 + 15;
			const waveHeight = Math.random() * 5 + 7;
			const waveX = this.river.x + Math.random() * this.river.width - waveWidth;
			const waveY = this.river.y + Math.random() * (this.river.height - waveHeight);

			ctx.fillStyle = '#4169E1';
			ctx.fillRect(waveX, waveY, waveWidth, waveHeight);
		}
	}

	drawCirlce(layer, x, y, size, color) {
		window.ctx[`${layer}`].fillStyle = color;
		window.ctx[`${layer}`].beginPath();
		window.ctx[`${layer}`].arc(x, y, size, 0, Math.PI * 2, false);
		window.ctx[`${layer}`].fill();
	}

	drawBeing(being) {
		const { x, y, size, color, /* statusColor */ } = being;
		// outer (status) circle
		this.drawCirlce("population", x, y, size + size / 3, "orange" /* statucSolor */);
		// inner (body)
		this.drawCirlce("population", x, y, size, `rgb(${color})`);
	}

	renderCurrentFrame() {
		this.drawWorld();
		this.drawEnvironment();
		this.drawBeings();
	}

	drawWorld() {
		// очистка
		window.ctx.world.clearRect(0, 0, window.innerWidth, window.innerHeight);
		// заливка
		window.ctx.world.fillStyle = this.fillStyle;
		window.ctx.world.fillRect(0, 0, window.innerWidth, window.innerHeight);
	}

	drawEnvironment() {
		// очистка
		window.ctx.environment.clearRect(0, 0, window.innerWidth, window.innerHeight);
		// окружение
		this.environment.forEach(entry => {
			this.drawCirlce("environment", entry.x, entry.y, entry.size, entry.color);
			// switch (entry.type) {
			// 	case "tree":
			// 		this.drawCirlce("environment", entry.x, entry.y, entry.size, "green");
			// 		break;
			// 	case "remains":
			// 		this.drawCirlce("environment", entry.x, entry.y, entry.size, "orange");
			// 		break;
			// 	case "organic":
			// 		this.drawCirlce("environment", entry.x, entry.y, entry.size, "yellow");
			// 		break;
			// }
		});
	}

	drawBeings() {
		// очистка
		window.ctx.population.clearRect(0, 0, window.innerWidth, window.innerHeight);
		// челы
		this.population.forEach(being => this.drawBeing(being));
	}

	simulateNextFrame() {
		this.population.forEach((being, index) => {
			if (being.isAlive) being.doSmth();
			if (!being.isAlive) {
				this.population.splice(index, 1);
				this.environment.push(new Remains(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, this.x, this.y, this.size / 3));
			}
		});

		for (let i = 0; i < this.environment.length; i++) {
			const element = this.environment[i];
			if (element instanceof Remains) {
				element.age = element.age + 1;
				if (element.age > 1000) {
					this.environment.splice(i, 1);
					i = i - 1;
				}
			}
		}

		this.age = this.age + 1;
	}

	animate() {
		if (!this.isLive) return;
		const animationID = requestAnimationFrame(() => this.animate());
		this.simulateNextFrame();
		this.renderCurrentFrame();
		return animationID;
	}
}