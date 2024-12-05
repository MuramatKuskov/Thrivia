class EnvironmentObject {
	constructor(id, x, y) {
		this.id = id;
		this.x = x;
		this.y = y;
	}
}

export class Organic extends EnvironmentObject {
	constructor(id, x, y, size) {
		super(id, x, y);
		this.size = size;	// change to energy, size calc by nrgy
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

export class Remains extends EnvironmentObject {
	constructor(id, x, y, size) {
		super(id, x, y);
		this.size = size;	// change to energy, size calc by nrgy
		// older ones starts to rot, giving less nrgy and more poison
		this.age = 0;
		this.color = "orange";
	}
}