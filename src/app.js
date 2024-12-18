import { initUserInterface, initRenderers } from "./modules/UserInterface.js";
import { Aqua } from "./modules/Simulation/Bioms/Aqua.js";
import { Fields } from "./modules/Simulation/Bioms/Fields.js";
import { Forest } from "./modules/Simulation/Bioms/Forest.js";
import { Sands } from "./modules/Simulation/Bioms/Sands.js";

const RENDERERS = {
	world: window.world,
	environment: window.environment,
	population: window.population,
	// effects: window.effects,
}

const BIOM_CONSTRUCTORS = {
	aqua: Aqua,
	fields: Fields,
	forest: Forest,
	sands: Sands
}

window.PARAMETERS = {
	geometry: document.querySelector('input[name="geometry"]:checked').value,
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
	populationRelativityGap: 5,
	respawnOrganic: true,
	drawFOV: window.fov.value === "true" ? true : false,
	drawRangeOfSight: false,
	drawRangeOfInteract: false,
	inspectionMode: false,
	paintScheme: document.querySelector('input[name="paint"]:checked').value,
}

function main() {
	initRenderers(RENDERERS);
	window.simulation = /* BIOM_CONSTRUCTORS[`${localStorage.biom}`] || */ new BIOM_CONSTRUCTORS.aqua();
	window.simulation.init();
	initUserInterface(BIOM_CONSTRUCTORS);
}

main();