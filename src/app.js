import { initUserInterface, initRenderers } from "./modules/UserInterface.js";
import { World } from "./modules/Simulation/Core/World.js";

const RENDERERS = {
	world: window.world,
	environment: window.environment,
	population: window.population,
	// effects: window.effects,
}

const PARAMETERS = {
	// 0 — closed (torus), 1 — confined
	geometry: parseInt(document.querySelector('input[name="geometry"]:checked').value),
	// biom: "aqua",
	// number
	population: parseInt(window["population-size"].value),
	//	px
	botSize: window.innerWidth / 235,
	initialOrganic: 25,
	inspectionMode: false,
}

function main() {
	initRenderers(RENDERERS);
	window.simulation = new World(PARAMETERS);
	window.simulation.init();
	initUserInterface(PARAMETERS);
}

main();