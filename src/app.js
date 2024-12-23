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

const PARAMETERS = {
	saveLastConfig: true,
	useLastConfig: true,
	geometry: "closed",
	biom: "aqua",
	population: 70,
	memSize: 32,
	// number of genome mutations that divides
	// relatives and non-relatives
	// 1 mutation = 2 changes
	populationRelativityGap: 12,
	organic: 150,
	organicEnergyValue: 90,
	dayNightPeriod: 1000, 	// frames
	seasonPeriod: 30000,  	// frames
	remainsLifespan: 3500,	// frames
	beingSizeMin: 5,
	beingSizeMax: 15,
	// scale beings with high energy
	allowGrowth: true,
	respawnOrganic: true,
	drawFOV: false,
	drawRangeOfSight: false,
	drawRangeOfInteract: false,
	inspectionMode: false,
	paintScheme: "default",
	targetSelectionStrategy: "cautious",
	continuousMovement: false,
}

window.resetDefaultParameters = function () {
	window.PARAMETERS = PARAMETERS;
}

const useLastConfig = JSON.parse(localStorage.getItem("use-last-config"));

if (useLastConfig) {
	window.PARAMETERS = JSON.parse(localStorage.getItem("last-config"));
} else {
	resetDefaultParameters();
	localStorage.setItem("use-last-config", JSON.stringify(true));
	localStorage.setItem("last-config", JSON.stringify(PARAMETERS));
}

function main() {
	initRenderers(RENDERERS);
	window.simulation = new BIOM_CONSTRUCTORS[`${window.PARAMETERS.biom}`]();
	window.simulation.init();
	initUserInterface(BIOM_CONSTRUCTORS);
}

main();