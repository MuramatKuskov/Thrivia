import { initUserInterface, initRenderers } from "./modules/UserInterface.js";
import { World } from "./modules/Simulation/Core/World.js";

const RENDERERS = {
	world: window.world,
	environment: window.environment,
	population: window.population,
	// effects: window.effects,
}

window.PARAMETERS = {
	// 0 — closed (torus), 1 — confined
	geometry: parseInt(document.querySelector('input[name="geometry"]:checked').value),
	// biom: "aqua",
	// number
	population: parseInt(window["population-size"].value),
	organic: parseInt(window["organic-count"].value),
	organicEnergyValue: 50,
	dayNightPeriod: 1000, 	// frames
	seasonPeriod: 30000,  	// frames
	remainsLifespan: 3500,	// frames
	beingSizeMin: 5,
	beingSizeMax: 15,
	// change size of beings with high energy
	allowGrowth: false,
	// number of genome mutations that divides
	// relatives and non-relatives
	populationRelativityGap: 3,
	respawnOrganic: true,
	drawFOV: false,
	drawRangeOfSight: false,
	drawRangeOfInteract: false,
	inspectionMode: false,
}

function main() {
	initRenderers(RENDERERS);
	window.simulation = new World();
	window.simulation.init();
	initUserInterface();
}

main();