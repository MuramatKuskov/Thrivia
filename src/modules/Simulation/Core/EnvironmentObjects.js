class EnvironmentObject {
	constructor(id, x, y) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.age = 0;
	}
}

export class Organic extends EnvironmentObject {
	constructor(id, x, y) {
		super(id, x, y);
		this.energy = PARAMETERS.organicEnergyValue;
		this.size = 4;
		this.color = "yellow";
	}
}

export class Tree extends EnvironmentObject {
	constructor(id, x, y, size) {
		super(id, x, y);
		this.size = size;
		this.color = "green";
	}
}

// older ones start to rot, giving less nrgy and more poison
export class Remains extends EnvironmentObject {
	constructor(id, x, y, energy) {
		super(id, x, y);
		this.energy = energy;
		this.size = PARAMETERS.allowGrowth ? Math.max(PARAMETERS.beingSizeMin, Math.min(PARAMETERS.beingSizeMin * (this.energy / 100), PARAMETERS.beingSizeMax)) : 5;
		this.color = "orange";
	}
}