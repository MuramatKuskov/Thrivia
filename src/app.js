const RENDERERS = {
	world: window.world,
	environment: window.environment,
	beings: window.beings
}

window.ctx = {};

Object.values(RENDERERS).forEach(renderer => {
	renderer.width = window.innerWidth;
	renderer.height = window.innerHeight;
	window.ctx[`${renderer.id}`] = renderer.getContext("2d");
});

const PARAMETERS = {
	// 0 — confined, 1 — closed (torus)
	geometry: 1,
	// number
	population: 50,
	//	px
	botSize: window.innerWidth / 235,
	inspectionMode: false,
}

function main() {

}

main();