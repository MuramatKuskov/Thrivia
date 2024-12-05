import { World } from "./Simulation/Core/World.js";

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

export function initUserInterface(parameters) {
	listenParameters(parameters);
	listenStreamControls(parameters);
	initInspector();
}

function listenParameters(parameters) {
	const parametersChanged = new CustomEvent('parametersChanged');
	const geometryOptions = document.querySelectorAll('input[name="geometry"]');

	const possibleGeometry = {};
	geometryOptions.forEach((geometryOption, index) => {
		possibleGeometry[geometryOption.id] = index;
	});


	document.addEventListener("parametersChanged", (e) => {
		const parameterChanged = e.target.activeElement.name;
		if (parameterChanged === "population") {
			window.simulation.population.length = parameters.population;
		} else {
			window.simulation[`${parameterChanged}`] = parameters[`${parameterChanged}`];
		}
	});

	window["population-size"].addEventListener('change', (event) => {
		parameters.population = parseInt(event.target.value);
		document.dispatchEvent(parametersChanged);
	});

	geometryOptions.forEach(option => {
		option.addEventListener("change", (event) => {
			parameters.geometry = possibleGeometry[`${event.target.id}`];
			document.dispatchEvent(parametersChanged);
		});
	});
}

function listenStreamControls(parameters) {
	const parametersContainer = document.querySelector('.parameters__container');
	const streamArea = document.querySelector(".stream__area");
	let simulationID;

	const playSimulation = () => {
		if (window.simulation.isLive) return;
		window.simulation.isLive = true;
		simulationID = window.simulation.animate();
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
		window.cancelAnimationFrame(simulationID);
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
	window["stop-btn"].addEventListener('click', () => {
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
		window.cancelAnimationFrame(simulationID);
		window.simulation = new World(parameters);
		window.simulation.init();
	});
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

// listen interact w env & beings layers
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
			inspectorTarget = object;
			document.dispatchEvent(targetSelectEvent);
		}
	}
}

// recursive animation call
function animateInspector() {
	if (inspectedLayer !== "world" && !inspectorTarget) {
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

	switch (inspectedLayer) {
		case "world":
			return console.log("age: " + window.simulation.age);
		case "environment":
			if (!inspectorTarget) {
				console.error("no tgt at layer: " + inspectedLayer);
				cancelAnimationFrame(inspectorAnimationID);
				inspectorTarget = null;
				break;
			}
			console.log(inspectorTarget);
			break;
		case "population":
			if (!inspectorTarget) {
				console.error("no tgt at layer: " + inspectedLayer);
				cancelAnimationFrame(inspectorAnimationID);
				inspectorTarget = null;
				break;
			}
			console.log(inspectorTarget);
			break;
	}
}