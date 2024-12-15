import { Being } from "./Simulation/Core/Being.js";
import { Organic, Remains } from "./Simulation/Core/EnvironmentObjects.js";

export function initRenderers(renderers) {
	window.ctx = {};

	Object.values(renderers).forEach(renderer => {
		renderer.width = window.innerWidth;
		renderer.height = window.innerHeight;
		window.ctx[`${renderer.id}`] = renderer.getContext("2d");
	});
}

const targetSelectEvent = new CustomEvent("targetSelect");
let inspectorAnimationID = null;
let inspectorTarget = null;
let inspectedLayer = window["layer-selector"].value;

export function initUserInterface(BIOM_CONSTRUCTORS) {
	listenParameters(BIOM_CONSTRUCTORS);
	listenStreamControls(BIOM_CONSTRUCTORS);
	initInspector();
}

function listenParameters(BIOM_CONSTRUCTORS) {
	const geometryOptions = document.querySelectorAll('input[name="geometry"]');
	const paintOptions = document.querySelectorAll('input[name="paint"]');

	window["population-size"].addEventListener('change', (event) => {
		PARAMETERS.population = parseInt(event.target.value);
	});
	window["organic-count"].addEventListener('change', (event) => {
		const newValue = parseInt(event.target.value);

		if (newValue > PARAMETERS.organic) {
			let diff = newValue - PARAMETERS.organic;
			for (let i = 0; i < diff; i++) {
				let [x, y] = window.simulation.getPointOutsideArea(4, window.simulation.environment);
				window.simulation.environment.push(new Organic(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, x, y));
			}
		} else {
			let count = 0;
			window.simulation.environment.forEach(entry => {
				if (entry instanceof Organic || entry instanceof Remains) count = count + 1;
			});

			for (let i = window.simulation.environment.length - 1; i >= 0; i--) {
				const entry = window.simulation.environment[i];
				if (entry instanceof Organic || entry instanceof Remains) {
					window.simulation.environment.splice(i, 1);
					count = count - 1;
				}
				if (count <= newValue) break;
			}
		}

		PARAMETERS.organic = newValue;
	});

	window.fov.addEventListener("change", event => {
		let state = event.target.value === "true" ? false : true;
		event.target.value = state;
		PARAMETERS.drawFOV = state;
		window.simulation.drawBeings();
	});

	window["geo-confirm"].addEventListener("click", () => {
		if (window.simulation instanceof BIOM_CONSTRUCTORS[window.biom.value]) return;
		stopSimulation(BIOM_CONSTRUCTORS);
	});

	geometryOptions.forEach(option => {
		option.addEventListener("change", (event) => {
			PARAMETERS.geometry = event.target.value;
		});
	});

	paintOptions.forEach(scheme => {
		scheme.addEventListener("change", (event) => {
			PARAMETERS.paintScheme = event.target.id;
			switch (PARAMETERS.paintScheme) {
				case "default":
					window.simulation.population.forEach(being => being.color = `${being.c_red}, ${being.c_green}, ${being.c_blue}`);
					break;
				case "smell":
					window.simulation.population.forEach(being => being.paintSmell);
					break;
				case "energy":
					window.simulation.population.forEach(being => being.paintEnergy());
					break;
			}
			window.simulation.drawBeings();
		});
	});
}

function listenStreamControls(BIOM_CONSTRUCTORS) {
	const parametersContainer = document.querySelector('.parameters__container');
	const streamArea = document.querySelector(".stream__area");

	const playSimulation = () => {
		if (window.simulation.isLive) return;
		window.simulation.isLive = true;
		window.simulation.animate();
		if (document.body.classList.contains("inspecting")) {
			inspectorAnimationID = animateInspector(window.simulation);
		}
		streamArea.classList.remove("transparent");
		parametersContainer.classList.add('hidden');
		// doesn't affect enabled inspector mode
		// class .pinned has higher priority
		window.inspector.classList.add("hidden");
		window["play-btn"].parentElement.classList.add('hidden');
		window["play-btn"].classList.add('hidden');
		window["pause-btn"].classList.remove('hidden');
	}
	const pauseSimulation = () => {
		if (inspectorAnimationID) {
			window.cancelAnimationFrame(inspectorAnimationID);
			inspectorAnimationID = null;
		}
		window.simulation.isLive = false;
		streamArea.classList.add("transparent");
		window["play-btn"].parentElement.classList.remove('hidden');
		window["play-btn"].classList.remove('hidden');
		window["pause-btn"].classList.add('hidden');
	}

	window["play-btn"].addEventListener('click', playSimulation);
	window["pause-btn"].addEventListener('click', pauseSimulation);
	window["next-frame-btn"].addEventListener('click', () => {
		if (window.simulation.isLive) return;
		window.simulation.simulateNextFrame();
		window.simulation.renderCurrentFrame();
		if (document.body.classList.contains("inspecting")) {
			updateInspector();
		}
	});
	window["stop-btn"].addEventListener('click', () => stopSimulation(BIOM_CONSTRUCTORS));
}

function stopSimulation(BIOM_CONSTRUCTORS) {
	const parametersContainer = document.querySelector('.parameters__container');
	parametersContainer.classList.remove('hidden');
	window.inspector.classList.remove("hidden");
	window["play-btn"].classList.remove('hidden');
	window["pause-btn"].classList.add('hidden');
	window["play-btn"].parentElement.classList.remove('hidden');

	if (inspectorAnimationID) {
		window.cancelAnimationFrame(inspectorAnimationID);
		inspectorAnimationID = null;
	}
	window.simulation.isLive = false;
	window.simulation = new BIOM_CONSTRUCTORS[window.biom.value]();
	window.simulation.init();
}

function initInspector() {
	window["inspect-trigger"].addEventListener("click", toggleInspector);
	window["layer-selector"].addEventListener("change", changeLayer);

	updateInspector();
}

// callback to toggle inspector mode
function toggleInspector() {
	document.body.classList.toggle("inspecting");
	window.inspector.classList.toggle("pinned");

	if (!inspectorAnimationID && window.simulation.isLive) {
		animateInspector();
		return;
	} else {
		document.addEventListener("targetSelect", resumeInspectorAnimation);
	}

	if (inspectedLayer !== "world" && inspectorAnimationID) {
		window[`${inspectedLayer}`].addEventListener("click", listenLayerInteract);
	}

	cancelAnimationFrame(inspectorAnimationID);
	inspectorAnimationID = null;
	window[`${inspectedLayer}`].removeEventListener("click", listenLayerInteract);
}

// handle interactivity of env & population layers
function changeLayer(event) {
	// remove previous listener if exists
	window[`${inspectedLayer}`].removeEventListener("click", listenLayerInteract);
	window[`${inspectedLayer}`].style.pointerEvents = "none";

	inspectedLayer = event.target.value;

	// enter inspector if layer selected when simulation isn't running
	if (!document.body.classList.contains("inspecting")) {
		toggleInspector();
	}

	if (inspectedLayer === "world") return document.dispatchEvent(targetSelectEvent);
	window[`${inspectedLayer}`].addEventListener("click", listenLayerInteract);
	window[`${inspectedLayer}`].style.pointerEvents = "all";
}

function listenLayerInteract(event) {
	const rect = event.target.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	for (const object of window.simulation[`${inspectedLayer}`]) {
		if (mouseX >= object.x - object.size && mouseX <= object.x + object.size &&
			mouseY >= object.y - object.size && mouseY <= object.y + object.size) {
			// unselect last
			if (inspectorTarget instanceof Being) {
				inspectorTarget.statusColor = "orange";
				window.simulation.drawBeings();
			}
			// select new
			inspectorTarget = object;
			if (inspectorTarget instanceof Being) {
				inspectorTarget.statusColor = "blue";
				window.simulation.drawBeings();
			}
			document.dispatchEvent(targetSelectEvent);
		}
	}
}

// recursive animation call
function animateInspector() {
	if (inspectedLayer !== "world" && !inspectorTarget || !window.simulation.isLive) {
		cancelAnimationFrame(inspectorAnimationID);
		document.addEventListener("targetSelect", resumeInspectorAnimation);
		return;
	}

	updateInspector();
	inspectorAnimationID = requestAnimationFrame(animateInspector);
}

function resumeInspectorAnimation() {
	if (window.simulation.isLive) {
		animateInspector();
		document.removeEventListener("targetSelect", resumeInspectorAnimation);
	} else {
		updateInspector();
	}
}

// insert data into html
function updateInspector() {
	// section where to insert data
	// const section = document.querySelector(`.inspector__section[data-layer="${inspectedLayer}"]`);

	if (inspectedLayer !== "world" && !inspectorTarget) {
		console.error("no tgt at layer: " + inspectedLayer);
		cancelAnimationFrame(inspectorAnimationID);
	}

	switch (inspectedLayer) {
		case "world":
			console.log(window.simulation);
			break;
		case "environment":
			console.log(inspectorTarget);
			break;
		case "population":
			if (!inspectorTarget.isAlive) inspectorTarget = null;
			console.log(inspectorTarget);
			break;
	}
}