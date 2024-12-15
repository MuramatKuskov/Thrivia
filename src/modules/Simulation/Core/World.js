import { Being } from "./Being.js";
import { Organic, Remains } from "./EnvironmentObjects.js";

export class World {
	constructor() {
		this.geometry = PARAMETERS.geometry;
		// this.forestCover = PARAMETERS.forestCover * 100;
		// this.newTreeSize = window.innerWidth / 135;
		this.population = [];
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
		for (let i = 0; i < PARAMETERS.population; i++) {
			let [x, y] = this.getPointOutsideArea(PARAMETERS.beingSizeMin, this.population);

			const being = new Being(i, x, y);
			being.initMemory(true);

			if (PARAMETERS.paintScheme === "smell") {
				being.paintSmell();
			} else if (PARAMETERS.paintScheme === "energy") {
				being.paintEnergy();
			}

			// big boy
			// if (i < 1) {
			// 	being.size = 25;
			// 	being.rangeOfSight = 80;
			// }
			this.population[i] = being;
		}

		// organic
		for (let i = 0; i < PARAMETERS.organic; i++) {
			const organic = new Organic(i, 0, 0);
			organic.x = this.getRandomPoint('x', organic.size);
			organic.y = this.getRandomPoint('y', organic.size);
			this.environment.push(organic);
		}

		this.renderCurrentFrame();
	}

	getRandomPoint(axis, subjectSize) {
		if (axis !== "x" && axis !== "y") {
			throw new Error("Valid axis required ('x' or 'y')");
		}

		let p;
		if (axis === "x") {
			p = Math.random() * (window.innerWidth - subjectSize);
		} else {
			p = Math.random() * (window.innerHeight - subjectSize);
		}
		return p;
	}

	getPointOutsideArea(subjectSize, avoid) {
		while (true) {
			const x = this.getRandomPoint('x', subjectSize);
			const y = this.getRandomPoint('y', subjectSize);

			if (!this.isOverlapping(x, y, subjectSize, avoid)) return [x, y];
		}
	}

	isOverlapping(x, y, size, objects) {
		// const leftEdge = x - size;
		// const upperEdge = y - size;

		for (const o of objects) {
			// let objEdges = {
			// 	left: o.x - o.size,
			// 	upper: o.y - o.size,
			// 	right: o.x + o.size,
			// 	bottom: o.y + o.size
			// }

			// if (
			// 	leftEdge + size * 2 >= objEdges.left &&
			// 	leftEdge <= objEdges.right &&
			// 	upperEdge + size * 2 >= objEdges.upper &&
			// 	upperEdge <= objEdges.bottom
			// ) {
			// 	console.log("over");
			// 	return true;
			// }

			if (x + size >= o.x - o.size &&
				x - size <= o.x + o.size &&
				y + size >= o.y - o.size &&
				y - size <= o.y + o.size) return true;
		}

		return false;
	}

	handleCollision(x, y, subjectSize, avoid) {
		while (
			x - subjectSize / 2 >= avoid.x - avoid.size
			&&
			x + subjectSize / 2 <= avoid.x + avoid.size
		) {
			x = this.getRandomPoint('x', subjectSize);
		}
		while (
			y - subjectSize / 2 >= avoid.y - avoid.size
			&&
			y + subjectSize / 2 <= avoid.y + avoid.size
		) {
			y = this.getRandomPoint('y', subjectSize);
		}

		// while (
		// 	x - subjectSize / 2 >= avoid.x - avoid.size &&
		// 	x + subjectSize / 2 <= avoid.x + avoid.size &&
		// 	y - subjectSize / 2 >= avoid.y - avoid.size &&
		// 	y + subjectSize / 2 <= avoid.y + avoid.size
		// ) {
		// 	x = this.getRandomPoint('x', subjectSize);
		// 	y = this.getRandomPoint('y', subjectSize);
		// }

		return [x, y];
	}

	// example
	/* drawRiver() {
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
	} */

	drawCirlce(layer, x, y, size, color) {
		window.ctx[`${layer}`].fillStyle = color;
		window.ctx[`${layer}`].beginPath();
		window.ctx[`${layer}`].arc(x, y, size, 0, Math.PI * 2, false);
		window.ctx[`${layer}`].fill();
	}

	drawBeing(being) {
		if (PARAMETERS.paintScheme === "smell") {
			being.paintSmell();
		} else if (PARAMETERS.paintScheme === "energy") {
			being.paintEnergy();
		}

		const { x, y, size, color, statusColor } = being;
		// outer (status) circle
		this.drawCirlce("population", x, y, size + size / 3, statusColor);
		// inner (body)
		this.drawCirlce("population", x, y, size, `rgb(${color})`);

		// eyesight
		if (PARAMETERS.drawFOV) {
			const area = being.getAreaOfSight();
			ctx.population.strokeStyle = "red";
			ctx.population.beginPath();
			ctx.population.moveTo(being.x, being.y);
			ctx.population.lineTo(area.leftX, area.leftY);
			ctx.population.lineTo(area.rightX, area.rightY);
			ctx.population.closePath();
			ctx.population.stroke();
		}

		if (PARAMETERS.drawRangeOfSight) {
			ctx.population.strokeStyle = "green";
			ctx.population.moveTo(being.x, being.y);
			ctx.population.beginPath();
			ctx.population.arc(being.x, being.y, size + being.rangeOfSight, 0, Math.PI * 2);
			ctx.population.stroke();
		}

		if (PARAMETERS.drawRangeOfInteract) {
			ctx.population.strokeStyle = "green";
			ctx.population.moveTo(being.x, being.y);
			ctx.population.beginPath();
			ctx.population.arc(being.x, being.y, size + being.rangeOfInteract, 0, Math.PI * 2);
			ctx.population.stroke();
		}
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
				this.environment.push(new Remains(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, being.x, being.y, Math.min(being.energy / 3, 80)));
			}
		});

		// stop simulation if all are dead
		if (!this.population.length) this.isLive = false;

		for (let i = 0; i < this.environment.length; i++) {
			const element = this.environment[i];
			if (element instanceof Remains) {
				if (element.age > PARAMETERS.remainsLifespan) {
					this.environment.splice(i, 1);
					i = i - 1;
				}
				element.age = element.age + 1;
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