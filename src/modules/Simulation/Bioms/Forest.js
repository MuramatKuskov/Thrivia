import { Tree } from "../Core/EnvironmentObjects.js";
import { World } from "../Core/World.js";


export class Forest extends World {
	constructor(PARAMETERS) {
		super(PARAMETERS);
		this.forestCover = (window.innerWidth * window.innerHeight) / (10 * 10) / 20;
		this.fillStyle = "#1eb025";
	}

	init() {
		// trees
		for (let i = 0; i < this.forestCover; i++) {
			// const x = this.getRandomPoint("x", 6);
			// const y = this.getRandomPoint("y", 6);
			const [x, y] = this.getPointOutsideArea(10, this.environment);
			this.environment.push(new Tree(i, x, y, 6));
		}
		super.init();
	}
}